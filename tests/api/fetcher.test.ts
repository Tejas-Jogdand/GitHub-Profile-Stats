import { describe, it, expect, vi } from 'vitest';
import {
  resolveUsername,
  fetchUserProfile,
  fetchHistoricalContributions,
} from '../../src/api/fetcher.js';
import userProfileFixture from '../fixtures/user-profile.json';
import historicalYearFixture from '../fixtures/historical-year.json';
import { Octokit } from 'octokit';

describe('API Fetcher Layer', () => {
  it('should use explicit username if provided', async () => {
    const mockOctokit = {
      graphql: vi.fn(),
    } as unknown as Octokit;

    const username = await resolveUsername(mockOctokit, 'octocat');
    expect(username).toBe('octocat');
    expect(mockOctokit.graphql).not.toHaveBeenCalled();
  });

  it('should query viewer login if username is not configured', async () => {
    const mockOctokit = {
      graphql: vi.fn().mockResolvedValue({
        viewer: { login: 'authenticated-user' },
      }),
    } as unknown as Octokit;

    const username = await resolveUsername(mockOctokit);
    expect(username).toBe('authenticated-user');
    expect(mockOctokit.graphql).toHaveBeenCalledTimes(1);
  });

  it('should fetch user profile and handle repository nodes', async () => {
    const mockOctokit = {
      graphql: vi.fn().mockResolvedValue(userProfileFixture),
    } as unknown as Octokit;

    const result = await fetchUserProfile(mockOctokit, 'octocat');

    expect(result.profile.login).toBe('octocat');
    expect(result.profile.repositories.nodes.length).toBe(3);
    expect(result.profile.repositoriesContributedTo?.totalCount).toBe(6);
    expect(result.rateLimit.remaining).toBe(4995);
  });

  it('should paginate repositories if hasNextPage is true', async () => {
    const firstPage = JSON.parse(JSON.stringify(userProfileFixture));
    firstPage.user.repositories.pageInfo = {
      hasNextPage: true,
      endCursor: 'cursor_page_1',
    };

    const secondPage = {
      rateLimit: { limit: 5000, cost: 1, remaining: 4994, resetAt: '2026-11-16T21:00:00Z' },
      user: {
        repositories: {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [
            {
              name: 'additional-repo',
              stargazerCount: 15,
              isFork: false,
              languages: { edges: [] },
            },
          ],
        },
      },
    };

    const mockOctokit = {
      graphql: vi.fn()
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage),
    } as unknown as Octokit;

    const result = await fetchUserProfile(mockOctokit, 'octocat');

    expect(result.profile.repositories.nodes.length).toBe(4);
    expect(mockOctokit.graphql).toHaveBeenCalledTimes(2);
  });

  it('should throw an informative error if user is not found', async () => {
    const mockOctokit = {
      graphql: vi.fn().mockResolvedValue({ user: null }),
    } as unknown as Octokit;

    await expect(fetchUserProfile(mockOctokit, 'nonexistent-user')).rejects.toThrow(
      /was not found or is inaccessible/
    );
  });

  it('should fetch historical contributions for all years up to current year', async () => {
    const mockOctokit = {
      graphql: vi.fn().mockResolvedValue(historicalYearFixture),
    } as unknown as Octokit;

    // Account created in 2025; assuming current year is 2026, it should query 2025 and 2026
    const currentYear = new Date().getUTCFullYear();
    const startYear = currentYear - 1;
    const expectedYearsCount = currentYear - startYear + 1; // 2 years

    const result = await fetchHistoricalContributions(
      mockOctokit,
      'octocat',
      `${startYear}-05-10T00:00:00Z`
    );

    expect(result.collections.length).toBe(expectedYearsCount);
    expect(result.collections[0].totalCommitContributions).toBe(98);
    expect(mockOctokit.graphql).toHaveBeenCalledTimes(expectedYearsCount);
  });
});
