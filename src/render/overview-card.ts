import { OverviewStats } from '../types/metrics.js';
import { CardTheme } from '../types/render.js';
import { CARD_DIMENSIONS } from '../config/constants.js';
import { renderCardWrapper, escapeXml } from './components/card.js';
import { renderIcon } from './components/icons.js';

export interface OverviewCardOptions {
  username?: string;
  theme: CardTheme;
}

/**
 * Renders the GitHub Overview statistics SVG card.
 */
export function renderOverviewCard(stats: OverviewStats, options: OverviewCardOptions): string {
  const { username, theme } = options;
  const { width, height, borderRadius } = CARD_DIMENSIONS.OVERVIEW;

  const title = username
    ? `${escapeXml(username)}'s GitHub Stats`
    : 'GitHub Stats';

  const items = [
    {
      icon: 'star' as const,
      label: 'Total Stars Earned',
      value: stats.totalStars.toLocaleString(),
    },
    {
      icon: 'commit' as const,
      label: 'Total Commits',
      value: stats.totalCommits.toLocaleString(),
    },
    {
      icon: 'pr' as const,
      label: 'Total Pull Requests',
      value: stats.totalPRs.toLocaleString(),
    },
    {
      icon: 'issue' as const,
      label: 'Total Issues',
      value: stats.totalIssues.toLocaleString(),
    },
    {
      icon: 'repo' as const,
      label: 'Contributed to',
      value: stats.totalContributedTo.toLocaleString(),
    },
  ];

  const startY = 66;
  const rowHeight = 24;

  const rowsMarkup = items
    .map((item, index) => {
      const y = startY + index * rowHeight;
      const iconY = y - 13;
      const iconMarkup = renderIcon(item.icon, 25, iconY, theme.iconColor);

      return `
    <!-- ${item.label} -->
    ${iconMarkup}
    <text class="stat-label" x="50" y="${y}">${item.label}:</text>
    <text class="stat-value" x="${width - 25}" y="${y}" text-anchor="end">${item.value}</text>`;
    })
    .join('');

  return renderCardWrapper({
    width,
    height,
    borderRadius,
    title,
    titleIcon: 'repo',
    theme,
    bodyContent: rowsMarkup,
  });
}
