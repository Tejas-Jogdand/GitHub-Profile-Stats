import { ContributionsCollection, RepositoryNode } from '../types/github.js';
import { OverviewStats } from '../types/metrics.js';

export interface OverviewCalculationOptions {
  includeHistory?: boolean;
}

/**
 * Calculates high-level overview metrics: total stars, commits, PRs, issues, and contributed repos.
 */
export function calculateOverview(
  primaryCollection: ContributionsCollection,
  repositories: RepositoryNode[],
  historicalCollections: ContributionsCollection[] = [],
  options: OverviewCalculationOptions = { includeHistory: true }
): OverviewStats {
  // Calculate total stars across all owned, non-fork repositories
  const totalStars = repositories
    .filter((repo) => !repo.isFork)
    .reduce((sum, repo) => sum + (repo.stargazerCount || 0), 0);

  // Determine which collections to include for activity counts
  const collections = options.includeHistory
    ? [primaryCollection, ...historicalCollections]
    : [primaryCollection];

  const totalCommits = collections.reduce(
    (sum, col) => sum + (col.totalCommitContributions || 0),
    0
  );

  const totalPRs = collections.reduce(
    (sum, col) => sum + (col.totalPullRequestContributions || 0),
    0
  );

  const totalIssues = collections.reduce(
    (sum, col) => sum + (col.totalIssueContributions || 0),
    0
  );

  const totalContributedTo = collections.reduce(
    (sum, col) => sum + (col.totalRepositoryContributions || 0),
    0
  );

  return {
    totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    totalContributedTo,
  };
}
