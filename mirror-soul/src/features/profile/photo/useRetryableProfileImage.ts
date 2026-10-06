import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/** A screen supplies its authorized profile/list query; never sign or rewrite S3 URLs here. */
export const ProfileImageReloadContext = createContext<(() => Promise<unknown>) | null>(null);

export function useRetryableProfileImage(uri?: string | null, reload?: () => Promise<unknown>) {
  const screenReload = useContext(ProfileImageReloadContext);
  const [attempt, setAttempt] = useState(0);
  const [failedRequest, setFailedRequest] = useState<string | null>(null);
  const [reloadRequest, setReloadRequest] = useState<string | null>(null);
  const request = `${uri ?? ''}:${attempt}`;
  const current = useRef(request);
  current.current = request;
  const alive = useRef(true);
  const lock = useRef<symbol | null>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const onError = useCallback(() => { if (alive.current && current.current === request) setFailedRequest(request); }, [request]);
  const retry = useCallback(async () => {
    if (lock.current) return;
    const operation = Symbol();
    lock.current = operation;
    setReloadRequest(request);
    try { await (reload ?? screenReload)?.(); }
    catch { /* The owning query displays its API failure; leave the photo retry available. */ }
    finally {
      if (lock.current === operation) {
        lock.current = null;
        if (alive.current) {
          // A renewed URL already owns a new native request; don't disturb that download.
          if (current.current === request) setAttempt(value => value + 1);
          setReloadRequest(null);
        }
      }
    }
  }, [request, reload, screenReload]);
  return { imageKey: request, failed: !!uri && failedRequest === request, isReloading: reloadRequest === request, onError, retry };
}
