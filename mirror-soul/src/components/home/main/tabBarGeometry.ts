import type { WindowSizeClass } from '@/src/hooks/useLayout';

const MAX_WIDTH: Record<WindowSizeClass, number> = { compact: Infinity, medium: 480, expanded: 560 };

/** Navigation has its own width cap so tablet tabs remain within comfortable reach. */
export function tabBarGeometry(width: number, left: number, right: number, fontScale: number, sizeClass: WindowSizeClass) {
  const safeWidth = Math.max(0, width - left - right);
  const outerGap = safeWidth < 350 || fontScale > 1.5 ? 10 : 16;
  const barWidth = Math.max(0, Math.min(MAX_WIDTH[sizeClass], safeWidth - outerGap * 2));
  const paddingHorizontal = fontScale > 1.5 ? 4 : 6;
  const available = Math.max(0, barWidth - paddingHorizontal * 2 - 2);
  const scrollable = available < 5 * 48;
  const tabWidth = Math.max(48, available / 5);
  const labelLines = Math.max(1, Math.ceil(33 * fontScale / Math.max(1, tabWidth - 6)));
  const estimatedHeight = Math.max(56, 24 + 4 + labelLines * 16 * fontScale + 14) + 18;
  return { width: barWidth, left: left + (safeWidth - barWidth) / 2, bottomGap: 8, paddingHorizontal, scrollable, tabWidth, estimatedHeight };
}

export function mainTabContentPadding(obstructionHeight: number, fallbackHeight: number) {
  return (obstructionHeight > 0 ? obstructionHeight : fallbackHeight) + 16;
}
