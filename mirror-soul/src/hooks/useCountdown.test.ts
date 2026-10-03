import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useCountdown } from './useCountdown';

let resume: (state: AppStateStatus) => void;
const remove = jest.fn();
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-04T00:00:00Z'));
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => { resume = listener; return { remove }; });
  remove.mockClear();
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });

it('uses elapsed time when the app resumes after timers were suspended', () => {
  const { result } = renderHook(() => useCountdown(180));
  act(() => result.current.start());
  act(() => { jest.setSystemTime(Date.now() + 90_000); resume('active'); });
  expect(result.current.timeLeft).toBe(90);
  expect(result.current.formattedTime).toBe('01:30');
  act(() => { jest.setSystemTime(Date.now() + 100_000); resume('active'); });
  expect(result.current.timeLeft).toBe(0);
  expect(result.current.isActive).toBe(false);
});

it('resets and starts a new code timer in the same event', () => {
  const { result } = renderHook(() => useCountdown(180));
  act(() => result.current.start());
  act(() => jest.advanceTimersByTime(60_000));
  expect(result.current.timeLeft).toBe(120);
  act(() => { result.current.reset(); result.current.start(); });
  expect(result.current.timeLeft).toBe(180);
  act(() => jest.advanceTimersByTime(1_000));
  expect(result.current.timeLeft).toBe(179);
  act(() => result.current.reset(0));
  expect(result.current.timeLeft).toBe(0);
  expect(result.current.isActive).toBe(false);
});

it('removes the resume subscription and interval when unmounted', () => {
  const { result, unmount } = renderHook(() => useCountdown());
  act(() => result.current.start());
  unmount();
  expect(remove).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});
