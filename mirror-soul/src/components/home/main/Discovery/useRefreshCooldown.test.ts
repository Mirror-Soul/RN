import { act, renderHook } from '@testing-library/react-native';
import { useRefreshCooldown } from './useRefreshCooldown';

const COOLDOWN_MS = 4000;

describe('useRefreshCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports no cooldown before startCooldown is called', () => {
    const { result } = renderHook(() => useRefreshCooldown());

    expect(result.current.isInCooldown).toBe(false);
  });

  it('enters cooldown immediately after startCooldown', () => {
    const { result } = renderHook(() => useRefreshCooldown());

    act(() => {
      result.current.startCooldown();
    });

    expect(result.current.isInCooldown).toBe(true);
  });

  it('stays in cooldown before the window elapses', () => {
    const { result } = renderHook(() => useRefreshCooldown());

    act(() => {
      result.current.startCooldown();
    });
    act(() => {
      jest.advanceTimersByTime(COOLDOWN_MS - 1000);
    });

    expect(result.current.isInCooldown).toBe(true);
  });

  it('flips back to false once the window elapses', () => {
    const { result } = renderHook(() => useRefreshCooldown());

    act(() => {
      result.current.startCooldown();
    });
    act(() => {
      jest.advanceTimersByTime(COOLDOWN_MS);
    });

    expect(result.current.isInCooldown).toBe(false);
  });

  it('restarts the full window if called again mid-cooldown', () => {
    const { result } = renderHook(() => useRefreshCooldown());

    act(() => {
      result.current.startCooldown();
    });
    act(() => {
      jest.advanceTimersByTime(COOLDOWN_MS - 500);
    });
    act(() => {
      result.current.startCooldown();
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // 원래 타이머라면 이미 끝났을 시점이지만, 재시작했으니 아직 쿨다운 중이어야 한다
    expect(result.current.isInCooldown).toBe(true);
  });
});
