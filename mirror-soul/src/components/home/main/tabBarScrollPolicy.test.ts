import { createTabBarScrollTracker } from './tabBarScrollPolicy';

it('hides after intentional downward movement and shows sooner when direction reverses', () => {
  const tracker = createTabBarScrollTracker();
  tracker.reset(0);
  expect(tracker.update(14, 2000, true)).toBeNull();
  expect(tracker.update(35, 2000, true)).toBeNull();
  expect(tracker.update(38, 2000, true)).toBe('compact');
  expect(tracker.update(33, 2000, true)).toBeNull();
  expect(tracker.update(26, 2000, true)).toBe('expand');
});

it('does not flicker for tiny reversals or stop-to-start scrolls', () => {
  const tracker = createTabBarScrollTracker();
  tracker.reset(200);
  for (const y of [201, 200, 202, 201, 203, 202, 204, 203]) {
    expect(tracker.update(y, 2000, true)).toBeNull();
  }
  tracker.reset(203);
  expect(tracker.update(233, 2000, true)).toBeNull();
  expect(tracker.update(239, 2000, true)).toBe('compact');
});

it('keeps navigation visible at boundaries, clamps bounce and handles non-scrollable content', () => {
  const tracker = createTabBarScrollTracker();
  expect(tracker.update(-50, 2000, true)).toBe('expand');
  expect(tracker.update(2010, 2000, true)).toBe('expand');
  expect(tracker.update(2005, 2000, true)).toBe('expand');
  expect(tracker.update(0, -40, true)).toBe('expand');
  expect(tracker.update(4, 10, true)).toBe('expand');
});

it('ignores refresh/programmatic offsets and reveals after viewport or content reflow', () => {
  const tracker = createTabBarScrollTracker();
  tracker.reset(200);
  expect(tracker.update(600, 2000, false)).toBeNull();
  expect(tracker.update(300, 2000, false)).toBeNull();
  expect(tracker.update(340, 2000, true)).toBe('compact');
  expect(tracker.update(342, 1500, true)).toBe('expand');
  expect(tracker.update(NaN, 1500, true)).toBeNull();
});
