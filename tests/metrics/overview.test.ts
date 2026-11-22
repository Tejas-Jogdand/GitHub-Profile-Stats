import { describe, it, expect } from 'vitest';
import { calculateOverview } from '../../src/metrics/overview.js';
import userProfileFixture from '../fixtures/user-profile.json';
import historicalYearFixture from '../fixtures/historical-year.json';
import { RepositoryNode } from '../../src/types/github.js';

describe('Overview Metrics Calculator', () => {
  it('should calculate stars and contributions from single collection', () => {
    const profile = userProfileFixture.user;
    const repos = profile.repositories.nodes as RepositoryNode[];

    const result = calculateOverview(
      profile.contributionsCollection,
      repos,
      [],
      { includeHistory: false }
    );

    // 85 + 42 + 18 = 145 stars
    expect(result.totalStars).toBe(145);
    expect(result.totalCommits).toBe(142);
    expect(result.totalPRs).toBe(28);
    expect(result.totalIssues).toBe(12);
    expect(result.totalContributedTo).toBe(6);
  });

  it('should accumulate historical counts when includeHistory is true', () => {
    const profile = userProfileFixture.user;
    const repos = profile.repositories.nodes as RepositoryNode[];
    const history = [
      historicalYearFixture.user.contributionsCollection,
      profile.contributionsCollection,
    ];

    const result = calculateOverview(
      profile.contributionsCollection,
      repos,
      history,
      { includeHistory: true }
    );

    expect(result.totalStars).toBe(145);
    // 98 (2025) + 142 (2026) = 240 commits
    expect(result.totalCommits).toBe(240);
    // 15 + 28 = 43 PRs
    expect(result.totalPRs).toBe(43);
    // 5 + 12 = 17 issues
    expect(result.totalIssues).toBe(17);
    // 3 + 6 = 9 contributed repos
    expect(result.totalContributedTo).toBe(9);
  });

  it('should avoid double-counting contributions by not adding primaryCollection when historicalCollections are provided', () => {
    const rollingPrimary = {
      totalCommitContributions: 100, // Rolling 365 days (contains overlap with 2025)
      totalPullRequestContributions: 20,
      totalIssueContributions: 10,
      totalRepositoryContributions: 5,
      contributionCalendar: { totalContributions: 100, weeks: [] },
    };

    const calendar2025 = {
      totalCommitContributions: 60, // Full calendar year 2025
      totalPullRequestContributions: 12,
      totalIssueContributions: 4,
      totalRepositoryContributions: 3,
      contributionCalendar: { totalContributions: 60, weeks: [] },
    };

    const calendar2026 = {
      totalCommitContributions: 80, // Full calendar year 2026
      totalPullRequestContributions: 15,
      totalIssueContributions: 8,
      totalRepositoryContributions: 4,
      contributionCalendar: { totalContributions: 80, weeks: [] },
    };

    const repos: RepositoryNode[] = [{ name: 'test', stargazerCount: 10, isFork: false }];

    // When includeHistory is true, it should sum ONLY calendar2025 + calendar2026 (60 + 80 = 140)
    // and NOT add rollingPrimary (which would cause 100 + 60 + 80 = 240)
    const multiYearResult = calculateOverview(rollingPrimary, repos, [calendar2025, calendar2026], {
      includeHistory: true,
    });

    expect(multiYearResult.totalCommits).toBe(140);
    expect(multiYearResult.totalPRs).toBe(27);
    expect(multiYearResult.totalIssues).toBe(12);
    expect(multiYearResult.totalContributedTo).toBe(7);

    // When includeHistory is false, it uses only rollingPrimary (100 commits)
    const singleYearResult = calculateOverview(rollingPrimary, repos, [calendar2025, calendar2026], {
      includeHistory: false,
    });

    expect(singleYearResult.totalCommits).toBe(100);

    // When includeHistory is true but historicalCollections is empty, it falls back to rollingPrimary
    const fallbackResult = calculateOverview(rollingPrimary, repos, [], {
      includeHistory: true,
    });

    expect(fallbackResult.totalCommits).toBe(100);
  });

  it('should exclude forked repositories from star count', () => {
    const profile = userProfileFixture.user;
    const repos: RepositoryNode[] = [
      { name: 'repo-1', stargazerCount: 50, isFork: false },
      { name: 'forked-repo', stargazerCount: 1000, isFork: true },
    ];

    const result = calculateOverview(
      profile.contributionsCollection,
      repos,
      [],
      { includeHistory: false }
    );

    expect(result.totalStars).toBe(50);
  });

  it('should handle empty repositories and collections safely', () => {
    const emptyCollection = {
      totalCommitContributions: 0,
      totalPullRequestContributions: 0,
      totalIssueContributions: 0,
      totalRepositoryContributions: 0,
      contributionCalendar: { totalContributions: 0, weeks: [] },
    };

    const result = calculateOverview(emptyCollection, []);

    expect(result.totalStars).toBe(0);
    expect(result.totalCommits).toBe(0);
    expect(result.totalPRs).toBe(0);
    expect(result.totalIssues).toBe(0);
    expect(result.totalContributedTo).toBe(0);
  });
});
