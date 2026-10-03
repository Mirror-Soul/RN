import { QueryClient } from '@tanstack/react-query';
import { mergeProfilePhotoCache } from './profilePhotoCache';
import { toPublicProfilePreview } from './toPublicProfile';
import { introductionPreview } from '../constants/introductionPreview';

it('preserves identity/detail fields on replacement and deletion', () => {
  const client = new QueryClient();
  const profile = { name: '소울', email: 'soul@example.com', profileImageUrl: 'old' };
  client.setQueryData(['profile', 'me'], profile);
  client.setQueryData(['profile', 'introduction'], { ...introductionPreview });
  mergeProfilePhotoCache(client, 'new');
  expect(client.getQueryData(['profile', 'me'])).toEqual({ ...profile, profileImageUrl: 'new' });
  expect(client.getQueryData(['profile', 'introduction'])).toEqual({ ...introductionPreview, profileImageUrl: 'new' });
  mergeProfilePhotoCache(client, null);
  expect(client.getQueryData(['profile', 'me'])).toEqual({ ...profile, profileImageUrl: null });
  client.clear();
});
it('does not create incomplete cache entries', () => {
  const client = new QueryClient();
  mergeProfilePhotoCache(client, 'new');
  expect(client.getQueryData(['profile', 'me'])).toBeUndefined();
  expect(client.getQueryData(['profile', 'introduction'])).toBeUndefined();
});
it('excludes private fields from the public preview', () => {
  const { match, detail } = toPublicProfilePreview(introductionPreview);
  expect(detail).not.toHaveProperty('email');
  expect(detail).not.toHaveProperty('matchingEnabled');
  expect(detail).not.toHaveProperty('jobDescription');
  expect(match.profileImageUrl).toBe(introductionPreview.profileImageUrl);
  expect(detail.voicePreview).toEqual(introductionPreview.voicePreview);
});
