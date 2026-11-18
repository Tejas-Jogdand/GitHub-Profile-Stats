import { CardTheme } from '../../types/render.js';
import { SVG_ICONS } from './icons.js';

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface CardWrapperOptions {
  width: number;
  height: number;
  borderRadius?: number;
  title: string;
  titleIcon?: keyof typeof SVG_ICONS;
  theme: CardTheme;
  bodyContent: string;
}

/**
 * Renders the common outer SVG frame, typography styles, border, background, and header.
 */
export function renderCardWrapper(options: CardWrapperOptions): string {
  const {
    width,
    height,
    borderRadius = 8,
    title,
    titleIcon,
    theme,
    bodyContent,
  } = options;

  const escapedTitle = escapeXml(title);
  const iconMarkup = titleIcon && SVG_ICONS[titleIcon]
    ? `<g transform="translate(25, 23)" fill="${theme.titleColor}">${SVG_ICONS[titleIcon]}</g>`
    : '';

  const titleX = titleIcon ? 48 : 25;

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  fill="none"
  role="img"
  aria-label="${escapedTitle}"
>
  <style>
    .header {
      font: 600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      fill: ${theme.titleColor};
      animation: fadeIn 0.6s ease-in-out;
    }
    .stat-label {
      font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      fill: ${theme.textColor};
    }
    .stat-value {
      font: 700 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      fill: ${theme.statColor};
    }
    .stat-hero {
      font: 800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      fill: ${theme.statColor};
    }
    .subtext {
      font: 400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      fill: ${theme.subtextColor};
    }
    .icon {
      color: ${theme.iconColor};
    }
    .icon-fire {
      color: ${theme.fireColor};
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  </style>

  <!-- Background Card -->
  <rect
    x="0.5"
    y="0.5"
    rx="${borderRadius}"
    height="${height - 1}"
    width="${width - 1}"
    fill="${theme.background}"
    stroke="${theme.border}"
    stroke-width="1"
  />

  <!-- Header -->
  <g class="header">
    ${iconMarkup}
    <text x="${titleX}" y="35">${escapedTitle}</text>
  </g>

  <!-- Card Body -->
  <g class="body">
    ${bodyContent}
  </g>
</svg>`;
}
