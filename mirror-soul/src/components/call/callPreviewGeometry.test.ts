import { fitCallPreview, previewCorner } from './callPreviewGeometry';

it.each([[280, 240], [700, 150], [300, 90], [900, 1000]])('keeps both preview sizes inside a %sx%s video area', (width, height) => {
  const bounds = { left: 0, top: 0, right: width, bottom: height };
  for (const enlarged of [false, true]) {
    const size = fitCallPreview(bounds, enlarged);
    for (const left of [false, true]) for (const top of [false, true]) {
      const position = previewCorner(left, top, size, bounds);
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.x + size.width).toBeLessThanOrEqual(width);
      expect(position.y + size.height).toBeLessThanOrEqual(height);
    }
  }
});

it('does not force a minimum preview size onto an area too small to contain it', () => {
  expect(fitCallPreview({ left: 0, right: 20, top: 0, bottom: 10 }, true)).toEqual({ width: 0, height: 0 });
});
