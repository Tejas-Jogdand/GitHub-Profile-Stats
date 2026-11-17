export interface RateLimitData {
  limit: number;
  cost: number;
  remaining: number;
  resetAt: string;
}

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  contributionCount: number;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface ContributionsCollection {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  totalRepositoryContributions: number;
  restrictedContributionsCount?: number;
  contributionCalendar: ContributionCalendar;
}

export interface LanguageNode {
  name: string;
  color: string | null;
}

export interface LanguageEdge {
  size: number; // bytes
  node: LanguageNode;
}

export interface RepositoryNode {
  name: string;
  stargazerCount: number;
  isFork: boolean;
  languages?: {
    edges: LanguageEdge[];
  };
}

export interface RepositoriesConnection {
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  nodes: RepositoryNode[];
}

export interface UserProfileData {
  login: string;
  name: string | null;
  createdAt: string;
  contributionsCollection: ContributionsCollection;
  repositories: RepositoriesConnection;
}

export interface UserQueryResponse {
  rateLimit: RateLimitData;
  user: UserProfileData | null;
  viewer?: {
    login: string;
  };
}

export interface ViewerQueryResponse {
  rateLimit: RateLimitData;
  viewer: UserProfileData;
}

export interface YearlyContributionsResponse {
  rateLimit: RateLimitData;
  user: {
    contributionsCollection: ContributionsCollection;
  } | null;
}
