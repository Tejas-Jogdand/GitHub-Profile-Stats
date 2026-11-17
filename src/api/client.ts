import { Octokit } from 'octokit';

/**
 * Creates and configures an authenticated Octokit client.
 */
export function createOctokitClient(token: string): Octokit {
  if (!token) {
    throw new Error('A GitHub token is required to initialize the Octokit client.');
  }

  return new Octokit({
    auth: token,
    userAgent: 'readme-stat-generator/1.0.0 (https://github.com)',
  });
}
