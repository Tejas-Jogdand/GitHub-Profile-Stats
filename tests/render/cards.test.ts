import { describe, it, expect } from 'vitest';
import { getTheme } from '../../src/render/themes.js';
import { renderOverviewCard } from '../../src/render/overview-card.js';
import { renderStreakCard } from '../../src/render/streak-card.js';
import { renderLanguagesCard } from '../../src/render/languages-card.js';
import { OverviewStats, StreakStats, LanguageStats } from '../../src/types/metrics.js';

describe('SVG Render Engine & Themes', () => {
  const theme = getTheme('github-dark');

  it('should return default theme when given an unknown theme name', () => {
    const fallbackTheme = getTheme('non-existent-theme');
    expect(fallbackTheme.name).toBe('github-dark');
  });

  it('should retrieve configured themes correctly', () => {
    const tokyoTheme = getTheme('tokyo-night');
    expect(tokyoTheme.name).toBe('tokyo-night');
    expect(tokyoTheme.background).toBe('#1a1b26');

    const draculaTheme = getTheme('dracula');
    expect(draculaTheme.name).toBe('dracula');
    expect(draculaTheme.titleColor).toBe('#ff79c6');
  });

  it('should render a valid Overview SVG card with correct metrics and XML tags', () => {
    const stats: OverviewStats = {
      totalStars: 145,
      totalCommits: 240,
      totalPRs: 43,
      totalIssues: 17,
      totalContributedTo: 9,
    };

    const svg = renderOverviewCard(stats, { username: 'octocat', theme });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('octocat&apos;s GitHub Stats');
    expect(svg).toContain('145');
    expect(svg).toContain('240');
    expect(svg).toContain('43');
    expect(svg).toContain('17');
    expect(svg).toContain('9');
    expect(svg).toContain(theme.background);
  });

  it('should render a valid Streak SVG card with hero stats and subtext', () => {
    const stats: StreakStats = {
      currentStreak: 7,
      longestStreak: 21,
      totalContributions: 350,
      firstContributionDate: '2024-01-01',
      latestContributionDate: '2026-11-16',
      isStreakActiveToday: true,
    };

    const svg = renderStreakCard(stats, { theme });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Contribution Streak');
    expect(svg).toContain('350');
    expect(svg).toContain('7');
    expect(svg).toContain('21');
    expect(svg).toContain('Active Today');
    expect(svg).toContain(theme.fireColor);
  });

  it('should render Grace Period in Streak card when streak is not yet active today', () => {
    const stats: StreakStats = {
      currentStreak: 5,
      longestStreak: 12,
      totalContributions: 100,
      firstContributionDate: '2024-01-01',
      latestContributionDate: '2026-11-15',
      isStreakActiveToday: false,
    };

    const svg = renderStreakCard(stats, { theme });
    expect(svg).toContain('Grace Period');
  });

  it('should render a valid Languages SVG card with progress bar and legend', () => {
    const stats: LanguageStats = {
      totalBytes: 100000,
      languages: [
        { name: 'TypeScript', color: '#3178c6', bytes: 60000, percentage: 60.0 },
        { name: 'Python', color: '#3572A5', bytes: 30000, percentage: 30.0 },
        { name: 'Other', color: '#8b949e', bytes: 10000, percentage: 10.0 },
      ],
    };

    const svg = renderLanguagesCard(stats, { theme });

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Most Used Languages');
    expect(svg).toContain('TypeScript');
    expect(svg).toContain('60.0%');
    expect(svg).toContain('Python');
    expect(svg).toContain('30.0%');
    expect(svg).toContain('clipPath');
  });

  it('should render empty state message when no languages exist', () => {
    const stats: LanguageStats = {
      totalBytes: 0,
      languages: [],
    };

    const svg = renderLanguagesCard(stats, { theme });
    expect(svg).toContain('No language data available');
    expect(svg).toContain('height="215"');
  });

  it('should maintain base height (215px) for 6 or fewer languages (<= 3 rows)', () => {
    const stats: LanguageStats = {
      totalBytes: 6000,
      languages: [
        { name: 'TypeScript', color: '#3178c6', bytes: 1000, percentage: 16.6 },
        { name: 'JavaScript', color: '#f1e05a', bytes: 1000, percentage: 16.6 },
        { name: 'Python', color: '#3572A5', bytes: 1000, percentage: 16.6 },
        { name: 'HTML', color: '#e34c26', bytes: 1000, percentage: 16.6 },
        { name: 'CSS', color: '#563d7c', bytes: 1000, percentage: 16.6 },
        { name: 'Other', color: '#8b949e', bytes: 1000, percentage: 16.6 },
      ],
    };

    const svg = renderLanguagesCard(stats, { theme });
    expect(svg).toContain('height="215"');
    expect(svg).toContain('viewBox="0 0 495 215"');
  });

  it('should dynamically expand height when MAX_LANGUAGES increases (> 3 rows)', () => {
    // 10 languages + 1 Other = 11 items -> ceil(11 / 2) = 6 rows
    // Calculated height: 96 + 6 * 28 + 35 = 299px
    const stats: LanguageStats = {
      totalBytes: 11000,
      languages: Array.from({ length: 11 }, (_, i) => ({
        name: `Lang${i + 1}`,
        color: '#3178c6',
        bytes: 1000,
        percentage: 9.09,
      })),
    };

    const svg = renderLanguagesCard(stats, { theme });
    expect(svg).toContain('height="299"');
    expect(svg).toContain('viewBox="0 0 495 299"');
    expect(svg).toContain('height="298"'); // Background rect height (height - 1)
  });
});
