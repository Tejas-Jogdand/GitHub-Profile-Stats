import { StreakStats } from '../types/metrics.js';
import { CardTheme } from '../types/render.js';
import { CARD_DIMENSIONS } from '../config/constants.js';
import { renderCardWrapper, escapeXml } from './components/card.js';
import { renderIcon } from './components/icons.js';

export interface StreakCardOptions {
  theme: CardTheme;
  title?: string;
}

/**
 * Formats a date string like '2024-01-15' into 'Jan 15, 2024'
 */
function formatDateLabel(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Renders the GitHub Contribution Streak SVG card with 3-column layout.
 */
export function renderStreakCard(stats: StreakStats, options: StreakCardOptions): string {
  const { theme, title = 'Contribution Streak' } = options;
  const { width, height, borderRadius } = CARD_DIMENSIONS.STREAK;

  const totalFormatted = stats.totalContributions.toLocaleString();
  const currentFormatted = stats.currentStreak.toLocaleString();
  const longestFormatted = stats.longestStreak.toLocaleString();

  const firstDateFormatted = formatDateLabel(stats.firstContributionDate);
  const statusSubtext = stats.isStreakActiveToday
    ? 'Active Today'
    : 'Grace Period';

  const col1X = 85;
  const col2X = 247;
  const col3X = 410;

  const divider1X = 166;
  const divider2X = 328;

  const bodyContent = `
    <!-- Column Dividers -->
    <line x1="${divider1X}" y1="65" x2="${divider1X}" y2="155" stroke="${theme.border}" stroke-width="1" stroke-dasharray="2 2" />
    <line x1="${divider2X}" y1="65" x2="${divider2X}" y2="155" stroke="${theme.border}" stroke-width="1" stroke-dasharray="2 2" />

    <!-- Column 1: Total Contributions -->
    <g transform="translate(${col1X}, 0)">
      <text class="stat-hero" x="0" y="98" text-anchor="middle">${totalFormatted}</text>
      <text class="stat-label" x="0" y="122" text-anchor="middle">Total</text>
      <text class="subtext" x="0" y="142" text-anchor="middle">Since ${firstDateFormatted}</text>
    </g>

    <!-- Column 2: Current Streak -->
    <g transform="translate(${col2X}, 0)">
      ${renderIcon('fire', -24, 76, theme.fireColor)}
      <text class="stat-hero" x="6" y="98" text-anchor="middle">${currentFormatted}</text>
      <text class="stat-label" x="0" y="122" text-anchor="middle">Current Streak</text>
      <text class="subtext" x="0" y="142" text-anchor="middle">${statusSubtext}</text>
    </g>

    <!-- Column 3: Longest Streak -->
    <g transform="translate(${col3X}, 0)">
      ${renderIcon('trophy', -24, 76, theme.titleColor)}
      <text class="stat-hero" x="6" y="98" text-anchor="middle">${longestFormatted}</text>
      <text class="stat-label" x="0" y="122" text-anchor="middle">Longest Streak</text>
      <text class="subtext" x="0" y="142" text-anchor="middle">All Time</text>
    </g>
  `;

  return renderCardWrapper({
    width,
    height,
    borderRadius,
    title,
    titleIcon: 'fire',
    theme,
    bodyContent,
  });
}
