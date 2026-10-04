import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { useProfileRefresh } from './useProfileRefresh';

jest.mock('expo-router', () => ({ useFocusEffect: (callback: () => void) => jest.requireActual('react').useEffect(callback, [callback]) }));
let change: (state: AppStateStatus) => void;
let remove: jest.Mock;
beforeEach(() => {
  jest.useFakeTimers();
  Object.defineProperty(AppState, 'currentState', { configurable: true, writable: true, value: 'active' });
  remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => { change = listener; return { remove }; });
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });
const tick = async (ms: number) => { await act(async () => jest.advanceTimersByTime(ms)); };

it('limits automatic checks to 90 seconds instead of polling a missing file forever', async () => {
  const refresh = jest.fn().mockResolvedValue(undefined);
  const hook = renderHook(() => useProfileRefresh(refresh, true));
  await tick(0);
  for (let i = 0; i < 6; i++) await tick(15000);
  expect(refresh).toHaveBeenCalledTimes(7);
  await tick(300000);
  expect(refresh).toHaveBeenCalledTimes(7);
  hook.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
});

it('stops in the background, refreshes on return, and stops when results are available', async () => {
  const refresh = jest.fn().mockResolvedValue(undefined);
  const hook = renderHook<void, {watch: boolean}>(({ watch }) => useProfileRefresh(refresh, watch), { initialProps: { watch: true } });
  await tick(0);
  act(() => { AppState.currentState = 'background'; change('background'); });
  await tick(30000);
  expect(refresh).toHaveBeenCalledTimes(1);
  act(() => { AppState.currentState = 'active'; change('active'); });
  await tick(0);
  expect(refresh).toHaveBeenCalledTimes(2);
  hook.rerender({ watch: false });
  await tick(0);
  const count = refresh.mock.calls.length;
  await tick(90000);
  expect(refresh).toHaveBeenCalledTimes(count);
});

it('does not overlap pending requests or restart timers after leaving the screen', async () => {
  let finish!: () => void;
  const refresh = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const hook = renderHook(() => useProfileRefresh(refresh, true));
  act(() => change('active'));
  await tick(60000);
  expect(refresh).toHaveBeenCalledTimes(1);
  hook.unmount();
  await act(async () => finish());
  await tick(90000);
  expect(refresh).toHaveBeenCalledTimes(1);
});
