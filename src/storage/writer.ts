import fs from 'node:fs/promises';
import path from 'node:path';

export interface CardOutput {
  filename: string; // e.g. 'overview.svg'
  content: string;
}

/**
 * Validates that an SVG string is non-empty and contains valid root XML tags.
 */
export function validateSvgContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  const trimmed = content.trim();
  return trimmed.startsWith('<svg') && trimmed.endsWith('</svg>');
}

/**
 * Atomically writes a single SVG card to disk using a staging file.
 * If an update fails, any existing file at the target path is preserved.
 */
export async function writeSvgAtomically(
  targetPath: string,
  content: string
): Promise<string> {
  if (!validateSvgContent(content)) {
    throw new Error(`Invalid SVG content for "${path.basename(targetPath)}": Missing valid SVG tags.`);
  }

  const dir = path.dirname(targetPath);
  await fs.mkdir(dir, { recursive: true });

  const tempPath = `${targetPath}.tmp.${Date.now()}`;

  try {
    // 1. Write to temporary staging file
    await fs.writeFile(tempPath, content, 'utf8');

    // 2. Atomically rename temporary file to target path
    await fs.rename(tempPath, targetPath);

    return targetPath;
  } catch (error) {
    // Attempt cleanup of temp file if it was created
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup error if temp file does not exist
    }
    throw error;
  }
}

/**
 * Atomically writes multiple SVG cards to disk.
 * Validates all cards prior to staging, and preserves previously generated files on failure.
 */
export async function writeSvgCards(
  outputDir: string,
  cards: CardOutput[]
): Promise<string[]> {
  // Pre-validate all cards before touching filesystem
  for (const card of cards) {
    if (!validateSvgContent(card.content)) {
      throw new Error(`Invalid SVG content for card "${card.filename}". Aborting write to preserve existing files.`);
    }
  }

  await fs.mkdir(outputDir, { recursive: true });

  const writtenPaths: string[] = [];
  const tempFiles: { tempPath: string; targetPath: string }[] = [];

  try {
    // Stage all cards to temp files first
    for (const card of cards) {
      const targetPath = path.resolve(outputDir, card.filename);
      const tempPath = `${targetPath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await fs.writeFile(tempPath, card.content, 'utf8');
      tempFiles.push({ tempPath, targetPath });
    }

    // Atomically swap all staged files to target paths
    for (const { tempPath, targetPath } of tempFiles) {
      await fs.rename(tempPath, targetPath);
      writtenPaths.push(targetPath);
    }

    return writtenPaths;
  } catch (error) {
    // On failure, clean up any remaining temp files
    for (const { tempPath } of tempFiles) {
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore unlink errors during rollback
      }
    }
    throw error;
  }
}
