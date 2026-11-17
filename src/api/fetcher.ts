import { Octokit } from 'octokit';

import {
  GET_VIEWER_LOGIN,
  GET_USER_PROFILE,
  GET_MORE_REPOSITORIES,
  GET_YEARLY_CONTRIBUTIONS,
} from './queries.js';

import {
  UserProfileData,
  UserQueryResponse,
  ViewerQueryResponse,
  YearlyContributionsResponse,
  ContributionsCollection,
  RepositoryNode,
  RateLimitData,
} from '../types/github.js';                                                                           
import { createOctokitClient } from './client.js';

export interface RawFetchedData {
  username: string;
  profile: UserProfileData;
  historicalCollections: ContributionsCollection[];
  rateLimit: RateLimitData;
}

/**
 * Resolves the target GitHub username.
 * If not explicitly configured, queries the authenticated viewer.
 */
export async function resolveUsername(octokit: Octokit, configuredUsername?: string): Promise<string> {
  if (configuredUsername && configuredUsername.trim().length > 0) {
    return configuredUsername.trim();
  }
  const response = await octokit.graphql<ViewerQueryResponse>(GET_VIEWER_LOGIN);
  if (!response?.viewer?.login) {
    throw new Error('Unable to resolve authenticated GitHub user login from token.');
  }

  return response.viewer.login;
}

/**
 * Fetches the user profile, primary contributions collection, and owned repositories.
 * Handles repository pagination if the user owns more than 100 repositories.
 */
export async function fetchUserProfile(
  octokit: Octokit,
  username: string,
  maxRepoPages = 10
): Promise<{ profile: UserProfileData; rateLimit: RateLimitData }> {
  const initialResponse = await octokit.graphql<UserQueryResponse>(GET_USER_PROFILE, {
    login: username,
  });

  if (!initialResponse.user) {
    throw new Error(`GitHub user "${username}" was not found or is inaccessible.`);
  }

  const profile = initialResponse.user;
  let currentRateLimit = initialResponse.rateLimit;
  const allRepositories: RepositoryNode[] = [...profile.repositories.nodes];

  let hasNextPage = profile.repositories.pageInfo.hasNextPage;
  let endCursor = profile.repositories.pageInfo.endCursor;
  let pageCount = 1;

  while (hasNextPage && endCursor && pageCount < maxRepoPages) {
    pageCount++;
    const nextPage = await octokit.graphql<UserQueryResponse>(GET_MORE_REPOSITORIES, {
      login: username,
      after: endCursor,
    });

    if (nextPage.user?.repositories) {
      allRepositories.push(...nextPage.user.repositories.nodes);
      hasNextPage = nextPage.user.repositories.pageInfo.hasNextPage;
      endCursor = nextPage.user.repositories.pageInfo.endCursor;
      currentRateLimit = nextPage.rateLimit;
    } else {
      break;
    }
  }

  profile.repositories.nodes = allRepositories;

  return {
    profile,
    rateLimit: currentRateLimit,
  };
}

/**
 * Fetches historical contributions for all years since account creation.
 * Returns an array of yearly ContributionsCollection in chronological order.
 */
export async function fetchHistoricalContributions(
  octokit: Octokit,
  username: string,
  createdAtIso: string
): Promise<{ collections: ContributionsCollection[]; rateLimit: RateLimitData | null }> {
  const createdDate = new Date(createdAtIso);
  const startYear = createdDate.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();

  const collections: ContributionsCollection[] = [];
  let latestRateLimit: RateLimitData | null = null;

  // Query years from startYear up to currentYear - 1
  // (The current rolling year is already present in the primary profile fetch)
  for (let year = startYear; year < currentYear; year++) {
    const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();

    const response = await octokit.graphql<YearlyContributionsResponse>(GET_YEARLY_CONTRIBUTIONS, {
      login: username,
      from,
      to,
    });

    if (response.user?.contributionsCollection) {
      collections.push(response.user.contributionsCollection);
      latestRateLimit = response.rateLimit;
    }
  }

  return {
    collections,
    rateLimit: latestRateLimit,
  };
}

/**
 * High-level orchestration function to fetch all raw GitHub data required for stats.
 */
export async function fetchGitHubData(
  token: string,
  username?: string,
  fetchMultiYear = true
): Promise<RawFetchedData> {
  const octokit = createOctokitClient(token);
  const resolvedUser = await resolveUsername(octokit, username);

  const { profile, rateLimit: profileRateLimit } = await fetchUserProfile(octokit, resolvedUser);

  let historicalCollections: ContributionsCollection[] = [];
  let latestRateLimit = profileRateLimit;

  if (fetchMultiYear) {
    const { collections, rateLimit: historyRateLimit } = await fetchHistoricalContributions(
      octokit,
      resolvedUser,
      profile.createdAt
    );
    historicalCollections = collections;
    if (historyRateLimit) {
      latestRateLimit = historyRateLimit;
    }
  }

  return {
    username: resolvedUser,
    profile,
    historicalCollections,
    rateLimit: latestRateLimit,
  };
}
