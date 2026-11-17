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
    const history = [historicalYearFixture.user.contributionsCollection];

    const result = calculateOverview(
      profile.contributionsCollection,
      repos,
      history,
      { includeHistory: true }
    );

    expect(result.totalStars).toBe(145);
    // 142 + 98 = 240 commits
    expect(result.totalCommits).toBe(240);
    // 28 + 15 = 43 PRs
    expect(result.totalPRs).toBe(43);
    // 12 + 5 = 17 issues
    expect(result.totalIssues).toBe(17);
    // 6 + 3 = 9 contributed repos
    expect(result.totalContributedTo).toBe(9);
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
