/** Inspect expiry without modifying signed query parameters or inventing download URLs. */
export function profileImageExpiry(uri: string): number | null {
  try {
    const url = new URL(uri);
    if (!url.searchParams.get('X-Amz-Signature')) return null;
    const date = url.searchParams.get('X-Amz-Date')?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
    const seconds = Number(url.searchParams.get('X-Amz-Expires'));
    if (!date || !Number.isFinite(seconds) || seconds <= 0) return null;
    return Date.UTC(+date[1], +date[2] - 1, +date[3], +date[4], +date[5], +date[6]) + seconds * 1000;
  } catch { return null; }
}

export function isUsableSignedProfileImage(uri: string | null | undefined, now = Date.now()) {
  if (!uri) return false;
  const expiry = profileImageExpiry(uri);
  return expiry !== null && expiry > now + 15_000;
}

export function sameProfileImageObject(first: string, second: string) {
  try {
    const a = new URL(first);
    const b = new URL(second);
    return a.origin === b.origin && decodeURIComponent(a.pathname) === decodeURIComponent(b.pathname);
  } catch { return first.split('?')[0] === second.split('?')[0]; }
}

export function shouldRefreshProfileImage(uri: string | null | undefined, now = Date.now()) {
  if (!uri) return false;
  try {
    const url = new URL(uri);
    if (url.searchParams.has('X-Amz-Signature')) return !isUsableSignedProfileImage(uri, now);
    return /(^|\.)s3([.-]|$)/.test(url.hostname) && url.hostname.endsWith('.amazonaws.com');
  } catch { return false; }
}

/** Null is an explicit deletion; only reuse a signed URL for the exact same photo. */
export function selectProfileImageUrl(primary: string | null | undefined, fallback: string | null | undefined, now = Date.now()): string | null {
  if (!primary) return null;
  if (fallback && sameProfileImageObject(primary, fallback) && isUsableSignedProfileImage(fallback, now) && !isUsableSignedProfileImage(primary, now)) return fallback;
  return primary;
}
