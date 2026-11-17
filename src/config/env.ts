import 'dotenv/config';
import path from 'node:path';
import { DEFAULT_CONFIG } from './constants.js';

export interface AppConfig {
  githubToken: string;
  githubUsername?: string;
  outputDir: string;
  fetchMultiYear: boolean;
  cardTheme: string;
  timezone: string;
  maxLanguages: number;
}

/**
 * Parses and validates environment variables into typed AppConfig.
 * Throws descriptive errors if critical variables are missing.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const githubToken = env.GITHUB_TOKEN?.trim() || '';
  const githubUsername = env.GITHUB_USERNAME?.trim() || undefined;
  const rawOutputDir = env.OUTPUT_DIR?.trim() || DEFAULT_CONFIG.OUTPUT_DIR;
  const outputDir = path.resolve(process.cwd(), rawOutputDir);

  const fetchMultiYear = env.FETCH_MULTI_YEAR !== undefined
    ? env.FETCH_MULTI_YEAR.toLowerCase() === 'true' || env.FETCH_MULTI_YEAR === '1'
    : DEFAULT_CONFIG.FETCH_MULTI_YEAR;

  const cardTheme = env.CARD_THEME?.trim() || DEFAULT_CONFIG.CARD_THEME;
  const timezone = env.TIMEZONE?.trim() || DEFAULT_CONFIG.TIMEZONE;

  const maxLanguages = env.MAX_LANGUAGES
    ? Number.parseInt(env.MAX_LANGUAGES, 10) || DEFAULT_CONFIG.MAX_LANGUAGES
    : DEFAULT_CONFIG.MAX_LANGUAGES;

  return {
    githubToken,
    githubUsername,
    outputDir,
    fetchMultiYear,
    cardTheme,
    timezone,
    maxLanguages,
  };
}

/**
 * Validates that the GitHub token is available before initiating API requests.
 */
export function validateApiToken(config: AppConfig): void {
  if (!config.githubToken) {
    throw new Error(
      'Missing GITHUB_TOKEN environment variable. Please set it in your .env file or environment.'
    );
  }
}
