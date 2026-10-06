import { mainTabContentPadding, tabBarGeometry } from './tabBarGeometry';

it('fits five non-overlapping touch targets in small phones and safe landscape windows', () => {
  for (const width of [280, 320, 360, 375, 393, 430, 600, 844, 1024]) {
    for (const fontScale of [1, 1.3, 1.8, 2, 3]) {
      for (const sideInset of [0, 20, 44]) {
        const sizeClass = width >= 840 ? 'expanded' : width >= 600 ? 'medium' : 'compact';
        const value = tabBarGeometry(width, sideInset, sideInset, fontScale, sizeClass);
        expect(value.left).toBeGreaterThanOrEqual(sideInset);
        expect(value.left + value.width).toBeLessThanOrEqual(width - sideInset);
        expect(value.tabWidth).toBeGreaterThanOrEqual(48);
        if (!value.scrollable) {
          expect(value.tabWidth * 5 + value.paddingHorizontal * 2 + 2).toBeCloseTo(value.width);
        }
        expect(value.estimatedHeight).toBeGreaterThanOrEqual(74);
      }
    }
  }
});

it('uses reachable overflow instead of shrinking tap targets in a narrow split window', () => {
  expect(tabBarGeometry(230, 0, 0, 1, 'compact').scrollable).toBe(true);
  expect(tabBarGeometry(320, 0, 0, 1, 'compact').scrollable).toBe(false);
});

it('reserves more height for large labels and caps the bar on tablets', () => {
  expect(tabBarGeometry(320, 0, 0, 3, 'compact').estimatedHeight).toBeGreaterThan(tabBarGeometry(320, 0, 0, 1, 'compact').estimatedHeight);
  expect(tabBarGeometry(768, 0, 0, 1, 'medium').width).toBe(480);
  expect(tabBarGeometry(1024, 0, 0, 1, 'expanded').width).toBe(560);
});

it('uses measured obstruction without duplicating safe area and falls back before layout', () => {
  expect(mainTabContentPadding(210, 108)).toBe(226);
  expect(mainTabContentPadding(0, 108)).toBe(124);
});
