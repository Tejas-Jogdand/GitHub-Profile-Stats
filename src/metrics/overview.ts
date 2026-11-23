import { ContributionsCollection, RepositoryNode } from '../types/github.js';
import { OverviewStats } from '../types/metrics.js';

export interface OverviewCalculationOptions {
  includeHistory?: boolean;
  repositoriesContributedToCount?: number;
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

  // Determine which collections to include for activity counts:
  // When includeHistory is true and historicalCollections are provided,
  // sum ONLY the discrete calendar-year collections (which already include the current year)
  // to avoid double-counting the overlap with rolling primaryCollection.
  const collections =
    options.includeHistory && historicalCollections.length > 0
      ? historicalCollections
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

  // Calculate total contributed to:
  // If lifetime repositoriesContributedToCount is provided and includeHistory is true,
  // use the exact unique count from GitHub API to avoid cross-year duplicate counting.
  // Otherwise, if includeHistory is false, use primaryCollection's 1-year count.
  // Fall back to summing collection counts if repositoriesContributedToCount is omitted.
  let totalContributedTo: number;
  if (!options.includeHistory) {
    totalContributedTo = primaryCollection.totalRepositoryContributions || 0;
  } else if (options.repositoriesContributedToCount !== undefined) {
    totalContributedTo = options.repositoriesContributedToCount;
  } else {
    totalContributedTo = collections.reduce(
      (sum, col) => sum + (col.totalRepositoryContributions || 0),
      0
    );
  }

  return {
    totalStars,
    totalCommits,
    totalPRs,
    totalIssues,
    totalContributedTo,
  };
}
