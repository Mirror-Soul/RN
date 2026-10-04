import { getPhotoEditorFrame } from './photoEditorLayout';

it.each([
  { width: 320, height: 410 },
  { width: 390, height: 610 },
  { width: 430, height: 680 },
  { width: 820, height: 900 },
])('fits the crop and its controls in the measured viewport (%p)', viewport => {
  const top = 44;
  const bottom = 136;
  const frame = getPhotoEditorFrame(viewport, top, bottom);
  expect(frame.width / frame.height).toBeCloseTo(4 / 5);
  expect(frame.width).toBeLessThanOrEqual(viewport.width - 32);
  expect(frame.height + top + bottom + 40).toBeLessThanOrEqual(viewport.height);
});

it('shrinks the photo to leave room for larger text instead of clipping the controls', () => {
  const viewport = { width: 390, height: 610 };
  const regular = getPhotoEditorFrame(viewport, 44, 136);
  const largeText = getPhotoEditorFrame(viewport, 88, 230);
  expect(largeText.height).toBeLessThan(regular.height);
  expect(largeText.height + 88 + 230 + 40).toBeLessThanOrEqual(viewport.height);
});

it.each(['detail', 'card', 'avatar'] as const)('fits the %s preview in the available space', mode => {
  const frame = getPhotoEditorFrame({ width: 320, height: 410 }, 82, 88, mode);
  expect(frame.height + 82 + 88 + 40).toBeLessThanOrEqual(410);
  expect(frame.width / frame.height).toBeCloseTo(mode === 'detail' ? 4 / 5 : mode === 'card' ? 4 / 3 : 1);
});

it('keeps the photo usable on a short landscape screen, allowing surrounding content to scroll', () => {
  const frame = getPhotoEditorFrame({ width: 667, height: 210 }, 88, 156);
  expect(frame.height).toBe(160);
  expect(frame.width).toBe(128);
});
