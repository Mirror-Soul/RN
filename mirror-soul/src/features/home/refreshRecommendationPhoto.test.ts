import { QueryClient } from '@tanstack/react-query';
import { refreshRecommendationPhoto } from './refreshRecommendationPhoto';
import { getRecommendationDetail, getRecommendations } from '@/src/services/homeService';
import { MOCK_RECOMMENDATIONS } from '@/src/components/home/main/Discovery/mockRecommendations';

let mockSession = { isLoggedIn: true, userUuid: 'me' };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => mockSession } }));
jest.mock('@/src/services/homeService', () => ({ getRecommendationDetail: jest.fn(), getRecommendations: jest.fn() }));
beforeEach(() => { mockSession = { isLoggedIn: true, userUuid: 'me' }; jest.clearAllMocks(); });

it('changes only the selected photo without moving cards, pagination or introduction fields', async () => {
  const client = new QueryClient();
  const people = MOCK_RECOMMENDATIONS.slice(0, 2);
  const selected = people[1];
  const original = { pages: [{ recommendations: people, page: 0, size: 10, hasNext: true }], pageParams: [0] };
  client.setQueryData(['home', 'recommendations'], original);
  jest.mocked(getRecommendationDetail).mockResolvedValue({ isSuccess: true, code: 'COMMON2000', message: 'ok', result: { userUuid: selected.userUuid, profileImageUrl: 'https://signed/new' } } as any);
  await refreshRecommendationPhoto(client, selected.userUuid);
  const updated = client.getQueryData<typeof original>(['home', 'recommendations'])!;
  expect(updated.pages[0].recommendations.map(person => person.userUuid)).toEqual(people.map(person => person.userUuid));
  expect(updated.pages[0].recommendations[0]).toEqual(people[0]);
  expect(updated.pages[0].recommendations[1]).toEqual({ ...selected, profileImageUrl: 'https://signed/new' });
  expect(updated.pageParams).toEqual([0]);
  expect(updated.pages[0].hasNext).toBe(true);
  client.clear();
});

it('does not attach an earlier account response to the current account cache', async () => {
  const client = new QueryClient();
  let resolve!: (value: any) => void;
  jest.mocked(getRecommendationDetail).mockImplementation(() => new Promise(finish => { resolve = finish; }));
  const operation = refreshRecommendationPhoto(client, 'target');
  mockSession = { isLoggedIn: true, userUuid: 'someone-else' };
  resolve({ isSuccess: true, result: { profileImageUrl: 'https://signed/old-account' } });
  await operation;
  expect(client.getQueryData(['home', 'recommendations'])).toBeUndefined();
  expect(client.getQueryData(['home', 'recommendationDetail', 'target'])).toBeUndefined();
  client.clear();
});

it('does not bypass a denied profile lookup or fabricate a download URL', async () => {
  const client = new QueryClient();
  jest.mocked(getRecommendationDetail).mockRejectedValue(new Error('RECOMMENDATION_TARGET_NOT_FOUND'));
  await expect(refreshRecommendationPhoto(client, 'target')).rejects.toThrow('RECOMMENDATION_TARGET_NOT_FOUND');
  expect(client.getQueryData(['home', 'recommendations'])).toBeUndefined();
  client.clear();
});

it('renews through the signed recommendation endpoint instead of downgrading to the raw detail URL', async () => {
  const client = new QueryClient();
  const person = { ...MOCK_RECOMMENDATIONS[0], profileImageUrl: 'https://bucket.s3.ap-northeast-2.amazonaws.com/profile-images/photo.jpg' };
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const freshUrl = `${person.profileImageUrl}?X-Amz-Date=${stamp}&X-Amz-Expires=300&X-Amz-Signature=new`;
  const data = { pages: [{ recommendations: [person], page: 0, size: 10, hasNext: false }], pageParams: [0] };
  client.setQueryData(['home', 'recommendations'], data);
  jest.mocked(getRecommendationDetail).mockResolvedValue({ isSuccess: true, result: { userUuid: person.userUuid, profileImageUrl: person.profileImageUrl } } as any);
  jest.mocked(getRecommendations).mockResolvedValue({ isSuccess: true, result: { ...data.pages[0], recommendations: [{ ...person, profileImageUrl: freshUrl }] } } as any);
  await refreshRecommendationPhoto(client, person.userUuid);
  expect(client.getQueryData<typeof data>(['home', 'recommendations'])!.pages[0].recommendations[0].profileImageUrl).toBe(freshUrl);
  expect(getRecommendations).toHaveBeenCalledTimes(1);
  client.clear();
});

it('finds a moved page without replacing the list or putting a removed photo back', async () => {
  const client = new QueryClient();
  const person = { ...MOCK_RECOMMENDATIONS[0], profileImageUrl: 'https://bucket.s3.ap-northeast-2.amazonaws.com/profile-images/photo.jpg' };
  const data = { pages: [{ recommendations: [person], page: 1, size: 10, hasNext: true }], pageParams: [1] };
  client.setQueryData(['home', 'recommendations'], data);
  jest.mocked(getRecommendationDetail).mockResolvedValue({ isSuccess: true, result: { userUuid: person.userUuid, profileImageUrl: person.profileImageUrl } } as any);
  jest.mocked(getRecommendations)
    .mockResolvedValueOnce({ isSuccess: true, result: { ...data.pages[0], recommendations: [] } } as any)
    .mockResolvedValueOnce({ isSuccess: true, result: { ...data.pages[0], page: 0, recommendations: [{ ...person, profileImageUrl: null }] } } as any);
  await refreshRecommendationPhoto(client, person.userUuid);
  expect(getRecommendations).toHaveBeenNthCalledWith(1, 1, 10);
  expect(getRecommendations).toHaveBeenNthCalledWith(2, 0, 10);
  expect(client.getQueryData<typeof data>(['home', 'recommendations'])!.pages[0].recommendations[0].profileImageUrl).toBeNull();
  expect(client.getQueryData<typeof data>(['home', 'recommendations'])!.pageParams).toEqual([1]);
  client.clear();
});
