import path from 'node:path';
import fs from 'node:fs/promises';
import { loadConfig, validateApiToken } from './config/env.js';
import { fetchGitHubData } from './api/fetcher.js';
import { calculateOverview } from './metrics/overview.js';
import { calculateStreak } from './metrics/streak.js';
import { calculateLanguages } from './metrics/languages.js';
import { getTheme } from './render/themes.js';
import { renderOverviewCard } from './render/overview-card.js';
import { renderStreakCard } from './render/streak-card.js';
import { renderLanguagesCard } from './render/languages-card.js';
import { writeSvgCards } from './storage/writer.js';
import { ContributionsCollection, RepositoryNode, UserProfileData, RateLimitData } from './types/github.js';

interface GenerationContext {
  username: string;
  profile: UserProfileData;
  historicalCollections: ContributionsCollection[];
  rateLimit: RateLimitData | null;
}

/**
 * Loads mock fixture data for offline testing or dry-runs.
 */
async function loadMockData(): Promise<GenerationContext> {
  const profileFixturePath = path.resolve(process.cwd(), 'tests/fixtures/user-profile.json');
  const historyFixturePath = path.resolve(process.cwd(), 'tests/fixtures/historical-year.json');

  const profileContent = await fs.readFile(profileFixturePath, 'utf8');
  const historyContent = await fs.readFile(historyFixturePath, 'utf8');

  const profileJson = JSON.parse(profileContent);
  const historyJson = JSON.parse(historyContent);

  return {
    username: profileJson.user.login,
    profile: profileJson.user,
    historicalCollections: [
      historyJson.user.contributionsCollection,
      profileJson.user.contributionsCollection,
    ],
    rateLimit: profileJson.rateLimit,
  };
}

/**
 * Main application runner.
 */
export async function run(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Starting GitHub Stats Generator...\n');

  const config = loadConfig();
  const isMockMode = process.argv.includes('--mock') || process.env.USE_MOCK === 'true';

  let context: GenerationContext;

  if (isMockMode) {
    console.log('ℹ️  Running in MOCK mode (using offline fixtures)...\n');
    context = await loadMockData();
  } else {
    try {
      validateApiToken(config);
    } catch (err: unknown) {
      console.warn('⚠️  GITHUB_TOKEN is missing or empty.');
      console.log('💡 Tip: Pass --mock (e.g. npm run dev -- --mock) to test locally with offline fixture data,\n' +
                  '   or set GITHUB_TOKEN in your .env file.\n');
      throw err;
    }

    console.log(`📡 Fetching GitHub data (Multi-Year: ${config.fetchMultiYear ? 'Enabled' : 'Disabled'})...`);
    const fetched = await fetchGitHubData(config.githubToken, config.githubUsername, config.fetchMultiYear);
    context = {
      username: fetched.username,
      profile: fetched.profile,
      historicalCollections: fetched.historicalCollections,
      rateLimit: fetched.rateLimit,
    };
  }

  const { username, profile, historicalCollections, rateLimit } = context;
  const repositories = (profile.repositories?.nodes || []) as RepositoryNode[];

  console.log(`👤 Target User: @${username}`);
  if (rateLimit) {
    console.log(`📊 API Rate Limit Remaining: ${rateLimit.remaining} / ${rateLimit.limit} (Cost: ${rateLimit.cost})`);
  }

  // 1. Calculate Statistics
  console.log('\n🧮 Calculating statistics...');
  const overviewStats = calculateOverview(
    profile.contributionsCollection,
    repositories,
    historicalCollections,
    { includeHistory: config.fetchMultiYear }
  );

  const streakStats = calculateStreak(
    profile.contributionsCollection,
    historicalCollections,
    { timezone: config.timezone }
  );

  const languageStats = calculateLanguages(repositories, {
    maxLanguages: config.maxLanguages,
  });

  // Log calculated metrics summary
  console.log(`   ⭐ Stars: ${overviewStats.totalStars.toLocaleString()}`);
  console.log(`   📦 Commits: ${overviewStats.totalCommits.toLocaleString()} | PRs: ${overviewStats.totalPRs} | Issues: ${overviewStats.totalIssues}`);
  console.log(`   🔥 Current Streak: ${streakStats.currentStreak} days | Longest: ${streakStats.longestStreak} days`);
  console.log(`   💻 Top Languages: ${languageStats.languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}`);

  // 2. Render SVG Cards
  const theme = getTheme(config.cardTheme);
  console.log(`\n🎨 Rendering SVG cards using theme "${theme.name}"...`);

  const overviewSvg = renderOverviewCard(overviewStats, { username, theme });
  const streakSvg = renderStreakCard(streakStats, { theme });
  const languagesSvg = renderLanguagesCard(languageStats, { theme });

  // 3. Persist atomically
  console.log(`💾 Writing cards atomically to: ${config.outputDir}`);
  const writtenPaths = await writeSvgCards(config.outputDir, [
    { filename: 'overview.svg', content: overviewSvg },
    { filename: 'streak.svg', content: streakSvg },
    { filename: 'languages.svg', content: languagesSvg },
  ]);

  for (const filePath of writtenPaths) {
    console.log(`   ✅ Saved: ${path.basename(filePath)}`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Successfully generated 3 stats cards in ${duration}s!`);
}

// Execute when run directly as CLI
if (process.argv[1] && process.argv[1].endsWith('index.ts') || (process.argv[1] && process.argv[1].endsWith('index.js'))) {
  run().catch((error) => {
    console.error('\n❌ Error generating GitHub stats:', error.message || error);
    process.exit(1);
  });
}
