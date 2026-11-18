import { CardTheme } from '../types/render.js';

export const THEMES: Record<string, CardTheme> = {
  'github-dark': {
    name: 'github-dark',
    background: '#0d1117',
    border: '#30363d',
    titleColor: '#58a6ff',
    textColor: '#8b949e',
    statColor: '#f0f6fc',
    subtextColor: '#6e7681',
    accent: '#238636',
    iconColor: '#58a6ff',
    fireColor: '#f85149',
    progressBarBackground: '#21262d',
  },
  'tokyo-night': {
    name: 'tokyo-night',
    background: '#1a1b26',
    border: '#292e42',
    titleColor: '#7aa2f7',
    textColor: '#9aa5ce',
    statColor: '#c0caf5',
    subtextColor: '#565f89',
    accent: '#bb9af7',
    iconColor: '#7dcfff',
    fireColor: '#f7768e',
    progressBarBackground: '#24283b',
  },
  dracula: {
    name: 'dracula',
    background: '#282a36',
    border: '#44475a',
    titleColor: '#ff79c6',
    textColor: '#bfbfbf',
    statColor: '#f8f8f2',
    subtextColor: '#6272a4',
    accent: '#50fa7b',
    iconColor: '#8be9fd',
    fireColor: '#ff5555',
    progressBarBackground: '#44475a',
  },
  'minimal-light': {
    name: 'minimal-light',
    background: '#ffffff',
    border: '#e1e4e8',
    titleColor: '#0366d6',
    textColor: '#586069',
    statColor: '#24292e',
    subtextColor: '#6a737d',
    accent: '#28a745',
    iconColor: '#0366d6',
    fireColor: '#d73a49',
    progressBarBackground: '#eaecef',
  },
};

/**
 * Retrieves a theme by name with automatic fallback to 'github-dark'.
 */
export function getTheme(themeName = 'github-dark'): CardTheme {
  const normalized = themeName.toLowerCase().trim();
  return THEMES[normalized] || THEMES['github-dark'];
}
