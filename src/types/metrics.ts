import { RateLimitData } from './github.js';

export interface OverviewStats {
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalContributedTo: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  firstContributionDate: string | null;
  latestContributionDate: string | null;
  isStreakActiveToday: boolean;
}

export interface LanguageMetric {
  name: string;
  color: string;
  bytes: number;
  percentage: number;
}

export interface LanguageStats {
  languages: LanguageMetric[];
  totalBytes: number;
}

export interface ProcessedUserData {
  username: string;
  name: string;
  createdAt: string;
  overview: OverviewStats;
  streak: StreakStats;
  languages: LanguageStats;
  rateLimit: RateLimitData;
}
