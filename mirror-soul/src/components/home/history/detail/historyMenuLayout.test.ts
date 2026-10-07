import { historyMenuLayout } from './historyMenuLayout';

const insets = { top: 44, bottom: 34, left: 0, right: 0 };
it.each([
  { width: 320, height: 568, contentWidth: 320, fontScale: 1, insets, anchor: { x: 248, y: 64, width: 48, height: 48 } },
  { width: 360, height: 740, contentWidth: 360, fontScale: 2, insets, anchor: { x: 288, y: 70, width: 48, height: 48 } },
  { width: 740, height: 360, contentWidth: 640, fontScale: 2, insets: { top: 0, bottom: 21, left: 44, right: 44 }, anchor: { x: 608, y: 30, width: 48, height: 48 } },
  { width: 1024, height: 1366, contentWidth: 900, fontScale: 1, insets, anchor: { x: 890, y: 64, width: 48, height: 48 } },
])('fits safe areas and points to its trigger: %j', config => {
  const result = historyMenuLayout({ ...config, headerBottom: 150 });
  expect(result.left).toBeGreaterThanOrEqual(config.insets.left + 12);
  expect(result.left + result.width).toBeLessThanOrEqual(config.width - config.insets.right - 12);
  expect(result.top! + result.maxHeight).toBeLessThanOrEqual(config.height - config.insets.bottom - 12);
  expect(result.top).toBe(config.anchor.y + config.anchor.height + 8);
  expect(result.left + result.connectorLeft + 5).toBeCloseTo(config.anchor.x + config.anchor.width / 2);
});

it('places the menu above the trigger when the bottom has insufficient room', () => {
  const result = historyMenuLayout({ width: 360, height: 420, contentWidth: 360, fontScale: 1, insets, headerBottom: 340, anchor: { x: 280, y: 320, width: 48, height: 48 } });
  expect(result.above).toBe(true);
  expect(result.top).toBeUndefined();
  expect(420 - result.bottom! - result.maxHeight).toBeGreaterThanOrEqual(insets.top + 12);
});

it('keeps a fallback menu usable until native measurement completes', () => {
  const result = historyMenuLayout({ width: 320, height: 568, contentWidth: 320, fontScale: 1, insets, anchor: null, headerBottom: 150 });
  expect(result.maxHeight).toBeGreaterThan(160);
  expect(result.left + result.width).toBeLessThanOrEqual(308);
});
