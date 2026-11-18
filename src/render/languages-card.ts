import { LanguageStats } from '../types/metrics.js';
import { CardTheme } from '../types/render.js';
import { CARD_DIMENSIONS } from '../config/constants.js';
import { renderCardWrapper, escapeXml } from './components/card.js';
import { renderProgressBar } from './components/progress-bar.js';

export interface LanguagesCardOptions {
  theme: CardTheme;
  title?: string;
}

/**
 * Renders the Most Used Languages SVG card with segmented progress bar and clean legend.
 */
export function renderLanguagesCard(stats: LanguageStats, options: LanguagesCardOptions): string {
  const { theme, title = 'Most Used Languages' } = options;
  const { width, height, borderRadius } = CARD_DIMENSIONS.LANGUAGES;

  const barX = 25;
  const barY = 56;
  const barWidth = width - 50; // 445px

  const progressBarMarkup = renderProgressBar({
    languages: stats.languages,
    x: barX,
    y: barY,
    width: barWidth,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.progressBarBackground,
  });

  let legendMarkup = '';

  if (stats.languages.length === 0) {
    legendMarkup = `
      <text class="stat-label" x="${width / 2}" y="130" text-anchor="middle">
        No language data available
      </text>`;
  } else {
    // Render 2-column legend
    const colWidth = barWidth / 2; // ~222px
    const rowHeight = 28;
    const startLegendY = 96;

    const items = stats.languages.map((lang, index) => {
      const colIndex = index % 2; // 0 for left column, 1 for right column
      const rowIndex = Math.floor(index / 2);

      const colX = barX + colIndex * colWidth;
      const textY = startLegendY + rowIndex * rowHeight;
      const dotCy = textY - 4;

      const escapedName = escapeXml(lang.name);
      const percentageText = `${lang.percentage.toFixed(1)}%`;

      return `
      <g>
        <circle cx="${colX + 5}" cy="${dotCy}" r="5" fill="${lang.color}" />
        <text class="stat-label" x="${colX + 18}" y="${textY}">${escapedName}</text>
        <text class="stat-value" x="${colX + colWidth - 20}" y="${textY}" text-anchor="end">${percentageText}</text>
      </g>`;
    });

    legendMarkup = items.join('\n');
  }

  const bodyContent = `
    <!-- Progress Bar -->
    ${progressBarMarkup}

    <!-- Language Legend -->
    <g class="legend">
      ${legendMarkup}
    </g>
  `;

  return renderCardWrapper({
    width,
    height,
    borderRadius,
    title,
    titleIcon: 'repo',
    theme,
    bodyContent,
  });
}
