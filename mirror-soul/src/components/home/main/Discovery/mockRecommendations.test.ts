import { getMockRecommendationDetail, isMockRecommendationUuid, MOCK_RECOMMENDATIONS } from './mockRecommendations';

describe('discovery mock recommendation details', () => {
  it('provides a typed detail fixture for every mock recommendation', () => {
    MOCK_RECOMMENDATIONS.forEach((recommendation) => {
      const detail = getMockRecommendationDetail(recommendation.userUuid);

      expect(detail).toBeDefined();
      expect(detail?.userUuid).toBe(recommendation.userUuid);
      expect(detail?.name).toBe(recommendation.name);
      expect(detail?.mbtiAxisScores).toEqual(
        expect.objectContaining({
          ieScore: expect.any(Number),
          nsScore: expect.any(Number),
          ftScore: expect.any(Number),
          pjScore: expect.any(Number),
        }),
      );
    });
  });

  it('does not treat an actual user UUID as mock data', () => {
    const actualUserUuid = 'f2a7d2b3-d414-4dfd-aec9-3cd2eb5e8f06';

    expect(isMockRecommendationUuid(actualUserUuid)).toBe(false);
    expect(getMockRecommendationDetail(actualUserUuid)).toBeUndefined();
  });

  it('keeps any mock-prefixed UUID out of the detail API path', () => {
    expect(isMockRecommendationUuid('mock-missing-fixture')).toBe(true);
    expect(getMockRecommendationDetail('mock-missing-fixture')).toBeUndefined();
  });
});
