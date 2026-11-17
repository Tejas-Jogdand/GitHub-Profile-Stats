import { describe, it, expect } from 'vitest';
import { loadConfig, validateApiToken } from '../../src/config/env.js';
import path from 'node:path';

describe('Configuration Loader', () => {
  it('should load default configuration when optional env vars are omitted', () => {
    const config = loadConfig({ GITHUB_TOKEN: 'test_token' });

    expect(config.githubToken).toBe('test_token');
    expect(config.githubUsername).toBeUndefined();
    expect(config.outputDir).toBe(path.resolve(process.cwd(), './generated'));
    expect(config.fetchMultiYear).toBe(true);
    expect(config.cardTheme).toBe('github-dark');
    expect(config.timezone).toBe('UTC');
    expect(config.maxLanguages).toBe(5);
  });

  it('should parse custom environment variables correctly', () => {
    const customEnv: NodeJS.ProcessEnv = {
      GITHUB_TOKEN: 'custom_token_123',
      GITHUB_USERNAME: 'octocat',
      OUTPUT_DIR: './custom-output',
      FETCH_MULTI_YEAR: 'false',
      CARD_THEME: 'dracula',
      TIMEZONE: 'Asia/Kolkata',
      MAX_LANGUAGES: '8',
    };

    const config = loadConfig(customEnv);

    expect(config.githubToken).toBe('custom_token_123');
    expect(config.githubUsername).toBe('octocat');
    expect(config.outputDir).toBe(path.resolve(process.cwd(), './custom-output'));
    expect(config.fetchMultiYear).toBe(false);
    expect(config.cardTheme).toBe('dracula');
    expect(config.timezone).toBe('Asia/Kolkata');
    expect(config.maxLanguages).toBe(8);
  });

  it('should throw an error when validateApiToken is called with an empty token', () => {
    const config = loadConfig({});
    expect(() => validateApiToken(config)).toThrow(/Missing GITHUB_TOKEN/);
  });

  it('should not throw when validateApiToken is called with a valid token', () => {
    const config = loadConfig({ GITHUB_TOKEN: 'valid_token' });
    expect(() => validateApiToken(config)).not.toThrow();
  });
});
