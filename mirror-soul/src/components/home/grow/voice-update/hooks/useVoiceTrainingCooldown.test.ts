import { act, renderHook } from '@testing-library/react-native';
import { useVoiceTrainingCooldown } from './useVoiceTrainingCooldown';

const COOLDOWN_MS = 2 * 60 * 1000;

describe('useVoiceTrainingCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-19T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports no cooldown when there is no last training time', () => {
    const { result } = renderHook(() => useVoiceTrainingCooldown(null));

    expect(result.current.isInCooldown).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('reports no cooldown once 2 minutes have already passed', () => {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { result } = renderHook(() => useVoiceTrainingCooldown(threeMinutesAgo));

    expect(result.current.isInCooldown).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('reports the full remaining seconds right after training finishes', () => {
    const justNow = new Date().toISOString();
    const { result } = renderHook(() => useVoiceTrainingCooldown(justNow));

    expect(result.current.isInCooldown).toBe(true);
    expect(result.current.remainingSeconds).toBe(120);
  });

  it('counts down as time passes', () => {
    const justNow = new Date().toISOString();
    const { result } = renderHook(() => useVoiceTrainingCooldown(justNow));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(115);
  });

  it('flips isInCooldown to false once the window elapses', () => {
    const justNow = new Date().toISOString();
    const { result } = renderHook(() => useVoiceTrainingCooldown(justNow));

    act(() => {
      jest.advanceTimersByTime(COOLDOWN_MS + 1000);
    });

    expect(result.current.isInCooldown).toBe(false);
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('restarts the countdown when lastVoiceTrainingAt moves to a newer time', () => {
    const firstTraining = new Date(Date.now() - 90 * 1000).toISOString(); // 30s left
    const { result, rerender } = renderHook(
      ({ lastVoiceTrainingAt }: { lastVoiceTrainingAt: string | null }) =>
        useVoiceTrainingCooldown(lastVoiceTrainingAt),
      { initialProps: { lastVoiceTrainingAt: firstTraining } }
    );

    expect(result.current.remainingSeconds).toBe(30);

    const secondTraining = new Date().toISOString(); // just now, full window left
    rerender({ lastVoiceTrainingAt: secondTraining });

    expect(result.current.remainingSeconds).toBe(120);
  });
});
