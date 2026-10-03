import type { DropdownAnchor } from './SelectDropdownModal';

interface Insets { top: number; bottom: number; left: number; right: number }
interface Size { width: number; height: number; fontScale?: number }

/** Keep an anchored list inside the current safe viewport, including after rotation. */
export function getDropdownLayout(anchor: DropdownAnchor, viewport: Size, insets: Insets, requested: { height?: number; maxHeight?: number } = {}) {
  const leftEdge = insets.left + 16;
  const rightEdge = Math.max(leftEdge + 1, viewport.width - insets.right - 16);
  const topEdge = insets.top + 16;
  const bottomEdge = Math.max(topEdge + 1, viewport.height - insets.bottom - 16);
  const width = Math.min(Math.max(1, anchor.width), rightEdge - leftEdge);
  const left = Math.max(leftEdge, Math.min(anchor.x, rightEdge - width));
  const desiredHeight = Math.min(requested.height ?? requested.maxHeight ?? 304, requested.maxHeight ?? Infinity, bottomEdge - topEdge);
  const minimumVisibleHeight = Math.min(120 * (viewport.fontScale ?? 1), desiredHeight);
  const below = anchor.y + anchor.height + 8;
  const top = Math.max(topEdge, Math.min(
    bottomEdge - below >= minimumVisibleHeight ? below : anchor.y - 8 - desiredHeight,
    bottomEdge - minimumVisibleHeight,
  ));
  const maxHeight = Math.max(1, Math.min(desiredHeight, bottomEdge - top));
  return { top, left, width, maxHeight, ...(requested.height !== undefined ? { height: maxHeight } : {}) };
}
