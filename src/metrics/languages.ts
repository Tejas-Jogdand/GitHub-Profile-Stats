import { RepositoryNode } from '../types/github.js';
import { LanguageMetric, LanguageStats } from '../types/metrics.js';
import { LANGUAGE_FALLBACK_COLORS } from '../config/constants.js';

export interface LanguageCalculationOptions {
  maxLanguages?: number;
  ignoredLanguages?: string[];
  includeForks?: boolean;
}

/**
 * Aggregates byte counts of programming languages across repositories
 * and calculates their distribution percentages.
 */
export function calculateLanguages(
  repositories: RepositoryNode[],
  options: LanguageCalculationOptions = {}
): LanguageStats {
  const maxLanguages = options.maxLanguages ?? 5;
  const ignored = new Set((options.ignoredLanguages || []).map((l) => l.toLowerCase()));
  const includeForks = options.includeForks ?? false;

  const byteMap = new Map<string, { bytes: number; color: string }>();

  for (const repo of repositories) {
    if (!includeForks && repo.isFork) continue;

    const edges = repo.languages?.edges || [];
    for (const edge of edges) {
      const name = edge.node.name;
      if (!name || ignored.has(name.toLowerCase())) continue;

      const size = edge.size || 0;
      if (size <= 0) continue;

      const color =
        edge.node.color ||
        LANGUAGE_FALLBACK_COLORS[name] ||
        LANGUAGE_FALLBACK_COLORS.Default;

      const existing = byteMap.get(name);
      if (existing) {
        existing.bytes += size;
      } else {
        byteMap.set(name, { bytes: size, color });
      }
    }
  }

  // Sort languages by bytes descending
  const sorted = Array.from(byteMap.entries()).sort(
    (a, b) => b[1].bytes - a[1].bytes
  );

  const totalBytes = sorted.reduce((sum, item) => sum + item[1].bytes, 0);

  if (totalBytes === 0) {
    return {
      languages: [],
      totalBytes: 0,
    };
  }

  const topLanguages = sorted.slice(0, maxLanguages);
  const remainingLanguages = sorted.slice(maxLanguages);

  const languages: LanguageMetric[] = topLanguages.map(([name, data]) => {
    const rawPct = (data.bytes / totalBytes) * 100;
    const percentage = Number(rawPct.toFixed(1));
    return {
      name,
      color: data.color,
      bytes: data.bytes,
      percentage,
    };
  });

  // If there are leftover languages beyond maxLanguages, group them as "Other"
  if (remainingLanguages.length > 0) {
    const otherBytes = remainingLanguages.reduce(
      (sum, item) => sum + item[1].bytes,
      0
    );
    const otherPct = Number(((otherBytes / totalBytes) * 100).toFixed(1));

    languages.push({
      name: 'Other',
      color: LANGUAGE_FALLBACK_COLORS.Default,
      bytes: otherBytes,
      percentage: otherPct,
    });
  }

  return {
    languages,
    totalBytes,
  };
}
