/**
 * Dimensions and styling constants for SVG cards
 */
export const CARD_DIMENSIONS = {
  OVERVIEW: {
    width: 495,
    height: 195,
    borderRadius: 8,
  },
  STREAK: {
    width: 495,
    height: 195,
    borderRadius: 8,
  },
  LANGUAGES: {
    width: 495,
    height: 215,
    borderRadius: 8,
  },
} as const;

export const DEFAULT_CONFIG = {
  OUTPUT_DIR: './generated',
  FETCH_MULTI_YEAR: true,
  CARD_THEME: 'github-dark',
  TIMEZONE: 'UTC',
  MAX_LANGUAGES: 5,
} as const;

/**
 * Fallback color mapping for major programming languages
 * (Used when GitHub API returns null color for a language node)
 */
export const LANGUAGE_FALLBACK_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Default: '#8b949e',
};
