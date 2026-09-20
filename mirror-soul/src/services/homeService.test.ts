import apiClient from './apiClient';
import { getRecommendationDetail, getRecommendations, swipeRecommendation } from './homeService';

jest.mock('./apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApiClient = apiClient as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

const okResponse = <T>(result: T) => ({
  data: { isSuccess: true, code: 'COMMON2000', message: 'ok', result, error: null },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('homeService', () => {
  it('getRecommendations passes page/size as query params', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({ recommendations: [], page: 0, size: 10, hasNext: false })
    );
    const response = await getRecommendations(0, 10);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/home/recommend', { params: { page: 0, size: 10 } });
    expect(response.result.hasNext).toBe(false);
  });

  it('getRecommendationDetail calls GET /home/recommendations/{uuid}', async () => {
    mockedApiClient.get.mockResolvedValueOnce(
      okResponse({
        userUuid: 'uuid-1',
        name: '서연',
        age: 28,
        profileImageUrl: 'https://example.com/a.jpg',
        syncRate: 94,
        region: { sidoName: '서울', sigunguName: '강남구' },
        job: 'IT_TECH',
        jobCertificationSubmitted: true,
        selfIntroduction: '안녕하세요',
        mbti: 'INFJ',
        mbtiIndicators: { ieScore: 72, nsScore: 65, ftScore: 70, pjScore: 75 },
        hashtags: ['차분한'],
        voicePreview: { audioUrl: 'https://example.com/a.mp3', contentType: 'audio/mpeg', durationMs: 5000 },
      })
    );
    const response = await getRecommendationDetail('uuid-1');
    expect(mockedApiClient.get).toHaveBeenCalledWith('/home/recommendations/uuid-1');
    expect(response.result.syncRate).toBe(94);
  });

  it('swipeRecommendation posts with no body to /home/recommendations/{uuid}/swipe', async () => {
    mockedApiClient.post.mockResolvedValueOnce(okResponse(null));
    await swipeRecommendation('uuid-1');
    expect(mockedApiClient.post).toHaveBeenCalledWith('/home/recommendations/uuid-1/swipe');
  });

  it('rethrows errors from apiClient so callers can handle them', async () => {
    const apiError = { code: 'RECOMMENDATION_TARGET_NOT_FOUND', message: '대상을 찾을 수 없습니다.' };
    mockedApiClient.get.mockRejectedValueOnce(apiError);
    await expect(getRecommendationDetail('uuid-404')).rejects.toEqual(apiError);
  });
});
