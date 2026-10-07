export interface PreviewBounds { top: number; bottom: number; left: number; right: number }

/** Fit the camera in the actual video area, including short landscape screens. */
export function fitCallPreview(bounds: PreviewBounds, enlarged: boolean) {
  const width = Math.max(0, bounds.right - bounds.left - 16);
  const height = Math.max(0, bounds.bottom - bounds.top - 16);
  const desired = enlarged ? 144 : 96;
  const fittedWidth = Math.min(desired, Math.min(width, Math.max(48, width * 0.42)), Math.min(height, Math.max(64, height * 0.48)) * 0.75);
  return { width: Math.floor(fittedWidth), height: Math.floor(fittedWidth / 0.75) };
}

export function previewCorner(left: boolean, top: boolean, size: { width: number; height: number }, bounds: PreviewBounds) {
  'worklet';
  return { x: left ? bounds.left + 8 : bounds.right - size.width - 8, y: top ? bounds.top + 8 : bounds.bottom - size.height - 8 };
}
