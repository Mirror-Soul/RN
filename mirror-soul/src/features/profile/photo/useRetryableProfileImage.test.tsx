import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { ProfileImageReloadContext, useRetryableProfileImage } from './useRetryableProfileImage';

it('reloads the owning API once and remounts the same URI for a manual retry', async () => {
  let finish!: () => void;
  const reload = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const wrapper = ({ children }: { children: React.ReactNode }) => <ProfileImageReloadContext.Provider value={reload}>{children}</ProfileImageReloadContext.Provider>;
  const { result } = renderHook(() => useRetryableProfileImage('https://signed/photo'), { wrapper });
  const stale = result.current.onError;
  act(() => result.current.onError());
  expect(result.current.failed).toBe(true);
  const initial = result.current.imageKey;
  let operation!: Promise<void>;
  act(() => { operation = result.current.retry(); void result.current.retry(); });
  expect(reload).toHaveBeenCalledTimes(1);
  expect(result.current.isReloading).toBe(true);
  await act(async () => { finish(); await operation; });
  expect(result.current.imageKey).not.toBe(initial);
  act(() => stale());
  expect(result.current.failed).toBe(false);
  expect(result.current.isReloading).toBe(false);
});

it('does not let an old error or pending refresh hide a renewed signed URL', async () => {
  let finish!: () => void;
  const reload = () => new Promise<void>(resolve => { finish = resolve; });
  const { result, rerender } = renderHook<ReturnType<typeof useRetryableProfileImage>, { uri: string }>(({ uri }) => useRetryableProfileImage(uri, reload), { initialProps: { uri: 'https://signed/photo?signature=old' } });
  const stale = result.current.onError;
  let operation!: Promise<void>;
  act(() => { operation = result.current.retry(); });
  rerender({ uri: 'https://signed/photo?signature=new' });
  const renewedKey = result.current.imageKey;
  act(() => stale());
  expect(result.current.failed).toBe(false);
  await act(async () => { finish(); await operation; });
  expect(result.current.imageKey).toBe(renewedKey);
  expect(result.current.isReloading).toBe(false);
});

it('keeps API errors retryable without starting an automatic retry loop or guessing S3 signatures', async () => {
  const reload = jest.fn().mockRejectedValue(new Error('Network unavailable'));
  const { result } = renderHook(() => useRetryableProfileImage('https://private-bucket/photo', reload));
  act(() => result.current.onError());
  expect(reload).not.toHaveBeenCalled();
  await act(async () => { await result.current.retry(); });
  expect(result.current.isReloading).toBe(false);
  act(() => result.current.onError());
  expect(result.current.failed).toBe(true);
  expect(reload).toHaveBeenCalledTimes(1);
});

it('allows a refresh to settle safely after unmount', async () => {
  let finish!: () => void;
  const { result, unmount } = renderHook(() => useRetryableProfileImage('https://photo', () => new Promise<void>(resolve => { finish = resolve; })));
  let operation!: Promise<void>;
  act(() => { operation = result.current.retry(); });
  unmount();
  await act(async () => { finish(); await operation; });
});
