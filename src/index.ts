import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, validateApiToken } from './config/env.js';
import { fetchGitHubData } from './api/fetcher.js';
import { calculateOverview } from './metrics/overview.js';
import { calculateStreak } from './metrics/streak.js';
import { calculateLanguages } from './metrics/languages.js';
import { ProcessedUserData } from './types/metrics.js';

// Re-export all submodules for library consumers
export * from './api/client.js';
export * from './api/fetcher.js';
export * from './api/queries.js';
export * from './config/constants.js';
export * from './config/env.js';
export * from './metrics/languages.js';
export * from './metrics/overview.js';
export * from './metrics/streak.js';
export * from './types/github.js';
export * from './types/metrics.js';

/**
 * Main execution function that loads config, fetches GitHub statistics,
 * and calculates all profile metrics (overview, streak, languages).
 */
export async function generateStats(): Promise<ProcessedUserData> {
  const config = loadConfig();
  validateApiToken(config);

  const rawData = await fetchGitHubData(
    config.githubToken,
    config.githubUsername,
    config.fetchMultiYear
  );

  const overview = calculateOverview(
    rawData.profile.contributionsCollection,
    rawData.profile.repositories.nodes,
    rawData.historicalCollections
  );

  const streak = calculateStreak(
    rawData.profile.contributionsCollection,
    rawData.historicalCollections,
    { timezone: config.timezone }
  );

  const languages = calculateLanguages(
    rawData.profile.repositories.nodes,
    { maxLanguages: config.maxLanguages }
  );

  return {
    username: rawData.username,
    name: rawData.profile.name || rawData.username,
    createdAt: rawData.profile.createdAt,
    overview,
    streak,
    languages,
    rateLimit: rawData.rateLimit,
  };
}

async function main(): Promise<void> {
  try {
    console.log('🚀 readme-stat-generator: Fetching and calculating GitHub stats...');
    const data = await generateStats();
    console.log(`\nGitHub Stats for ${data.username} (${data.name}):`);
    console.log('─'.repeat(45));
    console.log(`⭐ Stars:               ${data.overview.totalStars}`);
    console.log(`📦 Commits:             ${data.overview.totalCommits}`);
    console.log(`🔀 Pull Requests:       ${data.overview.totalPRs}`);
    console.log(`📝 Issues:              ${data.overview.totalIssues}`);
    console.log(`🔥 Current Streak:      ${data.streak.currentStreak} days`);
    console.log(`🏆 Longest Streak:      ${data.streak.longestStreak} days`);
    console.log(`📊 Total Contributions: ${data.streak.totalContributions}`);
    console.log('\nTop Languages:');
    for (const lang of data.languages.languages) {
      console.log(`  • ${lang.name.padEnd(14)} ${lang.percentage.toFixed(1)}%`);
    }
    console.log(
      `\nAPI Rate Limit: ${data.rateLimit.remaining}/${data.rateLimit.limit} remaining (resets at ${data.rateLimit.resetAt})`
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}`);
    } else {
      console.error('\n❌ Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Auto-run if executed directly as entrypoint
const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main();
}
