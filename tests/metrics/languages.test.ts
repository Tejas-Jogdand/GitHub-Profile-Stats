import { describe, it, expect } from 'vitest';
import { calculateLanguages } from '../../src/metrics/languages.js';
import userProfileFixture from '../fixtures/user-profile.json';
import { RepositoryNode } from '../../src/types/github.js';

describe('Languages Metrics Calculator', () => {
  it('should aggregate language bytes across repositories and compute percentages', () => {
    const repos = userProfileFixture.user.repositories.nodes as RepositoryNode[];

    const result = calculateLanguages(repos, { maxLanguages: 5 });

    // Fixture languages:
    // TypeScript: 120000 + 50000 = 170000 bytes
    // Python: 200000 bytes
    // HTML: 30000 bytes
    // JavaScript: 25000 bytes
    // CSS: 15000 bytes
    // Shell: 10000 bytes
    // Total = 450000 bytes
    expect(result.totalBytes).toBe(450000);

    // Python is top with 200,000 bytes (44.4%)
    expect(result.languages[0].name).toBe('Python');
    expect(result.languages[0].bytes).toBe(200000);
    expect(result.languages[0].percentage).toBe(44.4);

    // TypeScript is second with 170,000 bytes (37.8%)
    expect(result.languages[1].name).toBe('TypeScript');
    expect(result.languages[1].bytes).toBe(170000);
    expect(result.languages[1].percentage).toBe(37.8);

    // Since maxLanguages was 5, the 6th language (Shell) is grouped into "Other"
    const other = result.languages.find((l) => l.name === 'Other');
    expect(other).toBeDefined();
    expect(other?.bytes).toBe(10000);
    expect(other?.percentage).toBe(2.2);
  });

  it('should respect ignoredLanguages option', () => {
    const repos = userProfileFixture.user.repositories.nodes as RepositoryNode[];

    const result = calculateLanguages(repos, {
      ignoredLanguages: ['html', 'css'],
    });

    const hasHtml = result.languages.some((l) => l.name === 'HTML');
    const hasCss = result.languages.some((l) => l.name === 'CSS');

    expect(hasHtml).toBe(false);
    expect(hasCss).toBe(false);
  });

  it('should exclude forked repositories by default', () => {
    const repos: RepositoryNode[] = [
      {
        name: 'my-repo',
        stargazerCount: 1,
        isFork: false,
        languages: {
          edges: [{ size: 5000, node: { name: 'Rust', color: '#dea584' } }],
        },
      },
      {
        name: 'forked-repo',
        stargazerCount: 10,
        isFork: true,
        languages: {
          edges: [{ size: 90000, node: { name: 'Go', color: '#00ADD8' } }],
        },
      },
    ];

    const result = calculateLanguages(repos);

    expect(result.totalBytes).toBe(5000);
    expect(result.languages.length).toBe(1);
    expect(result.languages[0].name).toBe('Rust');
  });

  it('should return empty list when no repositories or languages exist', () => {
    const result = calculateLanguages([]);

    expect(result.totalBytes).toBe(0);
    expect(result.languages).toEqual([]);
  });
});
