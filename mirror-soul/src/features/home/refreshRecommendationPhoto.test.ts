import { QueryClient } from '@tanstack/react-query';
import { refreshRecommendationPhoto } from './refreshRecommendationPhoto';
import { getRecommendationDetail } from '@/src/services/homeService';
import { MOCK_RECOMMENDATIONS } from '@/src/components/home/main/Discovery/mockRecommendations';

let mockSession = { isLoggedIn: true, userUuid: 'me' };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => mockSession } }));
jest.mock('@/src/services/homeService', () => ({ getRecommendationDetail: jest.fn() }));
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
