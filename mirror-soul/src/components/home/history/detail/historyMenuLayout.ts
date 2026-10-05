export interface HistoryMenuAnchor { x: number; y: number; width: number; height: number }

/** Coordinates are relative to the screen root, not a nested header or the status bar. */
export function historyMenuLayout({ width, height, contentWidth, insets, anchor, headerBottom, fontScale }: {
  width: number; height: number; contentWidth: number; fontScale: number;
  insets: { top: number; bottom: number; left: number; right: number };
  anchor: HistoryMenuAnchor | null; headerBottom: number;
}) {
  const safeLeft = insets.left + 12;
  const safeRight = width - insets.right - 12;
  const menuWidth = Math.max(1, Math.min(contentWidth - 24, safeRight - safeLeft, fontScale > 1.3 ? contentWidth - 24 : 296));
  const fallbackRight = (width + contentWidth) / 2 - 24;
  const button = anchor ?? { x: fallbackRight - 48, y: headerBottom - 64, width: 48, height: 48 };
  const left = Math.max(safeLeft, Math.min(button.x + button.width - menuWidth, safeRight - menuWidth));
  const belowTop = button.y + button.height + 8;
  const belowSpace = Math.max(0, height - insets.bottom - 12 - belowTop);
  const aboveSpace = Math.max(0, button.y - 8 - insets.top - 12);
  const above = belowSpace < 160 && aboveSpace > belowSpace;
  return {
    left, width: menuWidth,
    top: above ? undefined : Math.max(insets.top + 12, belowTop),
    bottom: above ? height - button.y + 8 : undefined,
    maxHeight: Math.max(1, above ? aboveSpace : belowSpace),
    above,
    connectorLeft: Math.max(18, Math.min(menuWidth - 28, button.x + button.width / 2 - left - 5)),
  };
}
