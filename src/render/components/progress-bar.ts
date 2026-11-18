import { LanguageMetric } from '../../types/metrics.js';

export interface ProgressBarOptions {
  languages: LanguageMetric[];
  x: number;
  y: number;
  width: number;
  height?: number;
  borderRadius?: number;
  backgroundColor: string;
}

/**
 * Renders a segmented, rounded multi-color progress bar representing language percentages.
 */
export function renderProgressBar(options: ProgressBarOptions): string {
  const {
    languages,
    x,
    y,
    width,
    height = 8,
    borderRadius = 4,
    backgroundColor,
  } = options;

  if (languages.length === 0) {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${backgroundColor}" />`;
  }

  const clipId = 'progress-bar-clip';
  let xOffset = 0;
  const segments: string[] = [];

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    // Calculate segment width proportional to percentage
    const segmentWidth = Math.max(1, (lang.percentage / 100) * width);

    segments.push(
      `<rect x="${x + xOffset}" y="${y}" width="${segmentWidth.toFixed(1)}" height="${height}" fill="${lang.color}" />`
    );

    xOffset += segmentWidth;
  }

  return `
    <defs>
      <clipPath id="${clipId}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" />
      </clipPath>
    </defs>
    <!-- Background track -->
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" fill="${backgroundColor}" />
    <!-- Segmented progress -->
    <g clip-path="url(#${clipId})">
      ${segments.join('\n      ')}
    </g>
  `;
}
