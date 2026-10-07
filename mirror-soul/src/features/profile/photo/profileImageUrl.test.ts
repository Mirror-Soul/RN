import { isUsableSignedProfileImage, profileImageExpiry, sameProfileImageObject, selectProfileImageUrl, shouldRefreshProfileImage } from './profileImageUrl';

const raw = 'https://bucket.s3.ap-northeast-2.amazonaws.com/profile-images/photo.jpg';
const now = Date.UTC(2026, 9, 7, 1);
const signed = `${raw}?X-Amz-Date=20261007T010000Z&X-Amz-Expires=300&X-Amz-Signature=test`;

it('retains an authorized signed list URL when detail returns the same unsigned object', () => {
  expect(selectProfileImageUrl(raw, signed, now)).toBe(signed);
  expect(sameProfileImageObject(raw, signed)).toBe(true);
});

it('respects explicit deletion and a different photo rather than reviving old cached data', () => {
  expect(selectProfileImageUrl(null, signed, now)).toBeNull();
  expect(selectProfileImageUrl(`${raw}.new`, signed, now)).toBe(`${raw}.new`);
  expect(sameProfileImageObject(raw, 'https://other.s3.ap-northeast-2.amazonaws.com/profile-images/photo.jpg')).toBe(false);
});

it('detects expired signing metadata without modifying the signature or using a fixed server TTL', () => {
  expect(profileImageExpiry(signed)).toBe(now + 300_000);
  expect(isUsableSignedProfileImage(signed, now)).toBe(true);
  expect(isUsableSignedProfileImage(signed, now + 290_000)).toBe(false);
  expect(selectProfileImageUrl(raw, signed, now + 310_000)).toBe(raw);
  expect(shouldRefreshProfileImage(signed, now + 310_000)).toBe(true);
  expect(shouldRefreshProfileImage(raw, now)).toBe(true);
  expect(shouldRefreshProfileImage('file:///crop.jpg', now)).toBe(false);
  expect(shouldRefreshProfileImage('https://cdn.example.com/photo.jpg', now)).toBe(false);
});

it('uses the current primary signing URL and rejects incomplete expiry metadata as proof of validity', () => {
  expect(selectProfileImageUrl(signed, `${signed}2`, now)).toBe(signed);
  expect(profileImageExpiry(`${raw}?X-Amz-Signature=test`)).toBeNull();
  expect(isUsableSignedProfileImage(`${raw}?X-Amz-Signature=test`, now)).toBe(false);
});
