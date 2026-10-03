import { getDropdownLayout } from './dropdownLayout';

const noInsets = { top: 0, bottom: 0, left: 0, right: 0 };

it.each([
  ['small phone', { width: 320, height: 568 }, noInsets],
  ['notched phone', { width: 393, height: 852 }, { top: 59, bottom: 34, left: 0, right: 0 }],
  ['landscape phone', { width: 852, height: 393 }, { top: 0, bottom: 21, left: 59, right: 59 }],
  ['tablet', { width: 1024, height: 1366 }, { top: 24, bottom: 20, left: 0, right: 0 }],
  ['resized window', { width: 280, height: 220 }, noInsets],
  ['large text on small phone', { width: 320, height: 568, fontScale: 2 }, noInsets],
  ['large text in landscape', { width: 852, height: 393, fontScale: 3 }, { top: 0, bottom: 21, left: 59, right: 59 }],
] as const)('keeps stale anchors and tall lists in the safe area on %s', (_, viewport, insets) => {
  const layout = getDropdownLayout({ x: 700, y: 750, width: 600, height: 80 }, viewport, insets, { height: 303.5 });
  expect(layout.left).toBeGreaterThanOrEqual(insets.left + 16);
  expect(layout.left + layout.width).toBeLessThanOrEqual(viewport.width - insets.right - 16);
  expect(layout.top).toBeGreaterThanOrEqual(insets.top + 16);
  expect(layout.top + layout.maxHeight).toBeLessThanOrEqual(viewport.height - insets.bottom - 16);
  expect(layout.height).toBe(layout.maxHeight);
});

it('keeps the panel below its trigger when a shorter list still fits', () => {
  const layout = getDropdownLayout({ x: 24, y: 380, width: 272, height: 52 }, { width: 320, height: 600 }, noInsets, { height: 303.5 });
  expect(layout.top).toBe(440);
  expect(layout.height).toBe(144);
});

it('respects both a requested maximum and the viewport bound', () => {
  const viewport = { width: 320, height: 200 };
  const layout = getDropdownLayout({ x: 24, y: 160, width: 272, height: 52 }, viewport, noInsets, { maxHeight: 240 });
  expect(layout.maxHeight).toBeLessThanOrEqual(168);
  expect(layout.top + layout.maxHeight).toBeLessThanOrEqual(184);
});
