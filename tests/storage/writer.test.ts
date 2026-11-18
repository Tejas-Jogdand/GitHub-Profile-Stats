import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  validateSvgContent,
  writeSvgAtomically,
  writeSvgCards,
} from '../../src/storage/writer.js';

describe('Atomic Storage Writer', () => {
  const testOutputDir = path.resolve(process.cwd(), './tests-temp-output');

  beforeEach(async () => {
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it('should validate SVG content correctly', () => {
    expect(validateSvgContent('<svg width="100" height="100"></svg>')).toBe(true);
    expect(validateSvgContent('   <svg><g></g></svg>   ')).toBe(true);
    expect(validateSvgContent('')).toBe(false);
    expect(validateSvgContent('<div>Not SVG</div>')).toBe(false);
    expect(validateSvgContent('<svg>Unclosed')).toBe(false);
  });

  it('should write an SVG file atomically and overwrite cleanly', async () => {
    const targetFile = path.join(testOutputDir, 'card.svg');
    const contentV1 = '<svg><text>Version 1</text></svg>';
    const contentV2 = '<svg><text>Version 2</text></svg>';

    // First write
    await writeSvgAtomically(targetFile, contentV1);
    const readV1 = await fs.readFile(targetFile, 'utf8');
    expect(readV1).toBe(contentV1);

    // Overwrite
    await writeSvgAtomically(targetFile, contentV2);
    const readV2 = await fs.readFile(targetFile, 'utf8');
    expect(readV2).toBe(contentV2);
  });

  it('should reject invalid SVG and not alter existing file', async () => {
    const targetFile = path.join(testOutputDir, 'preserve.svg');
    const originalContent = '<svg><text>Original Content</text></svg>';

    await writeSvgAtomically(targetFile, originalContent);

    // Attempt writing invalid SVG
    await expect(writeSvgAtomically(targetFile, 'Corrupted Data')).rejects.toThrow(
      /Missing valid SVG tags/
    );

    // Existing file should remain completely untouched
    const preserved = await fs.readFile(targetFile, 'utf8');
    expect(preserved).toBe(originalContent);
  });

  it('should batch write multiple cards and preserve existing on validation error', async () => {
    const existingFile = path.join(testOutputDir, 'overview.svg');
    await fs.writeFile(existingFile, '<svg><text>Existing Overview</text></svg>', 'utf8');

    const cards = [
      { filename: 'overview.svg', content: '<svg><text>New Overview</text></svg>' },
      { filename: 'streak.svg', content: '<svg><text>Streak</text></svg>' },
      { filename: 'languages.svg', content: 'BAD_DATA' }, // Invalid!
    ];

    await expect(writeSvgCards(testOutputDir, cards)).rejects.toThrow(
      /Aborting write to preserve existing files/
    );

    // The existing overview file MUST NOT be overwritten
    const preserved = await fs.readFile(existingFile, 'utf8');
    expect(preserved).toBe('<svg><text>Existing Overview</text></svg>');

    // The streak file should NOT have been created either
    const streakExists = await fs
      .access(path.join(testOutputDir, 'streak.svg'))
      .then(() => true)
      .catch(() => false);
    expect(streakExists).toBe(false);
  });

  it('should successfully write all cards in batch when all are valid', async () => {
    const cards = [
      { filename: 'overview.svg', content: '<svg><text>Overview</text></svg>' },
      { filename: 'streak.svg', content: '<svg><text>Streak</text></svg>' },
      { filename: 'languages.svg', content: '<svg><text>Languages</text></svg>' },
    ];

    const writtenPaths = await writeSvgCards(testOutputDir, cards);
    expect(writtenPaths.length).toBe(3);

    for (const card of cards) {
      const filePath = path.join(testOutputDir, card.filename);
      const content = await fs.readFile(filePath, 'utf8');
      expect(content).toBe(card.content);
    }
  });
});
