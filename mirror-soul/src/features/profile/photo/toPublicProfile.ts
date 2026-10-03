import type { MyIntroductionResult } from '@/src/types/api/profile';
import type { Recommendation, RecommendationDetailResult } from '@/src/types/api/home';

/** 공개 표시 필드만 골라낸다. 이메일, 계정 설정, 학습 이력은 전달하지 않는다. */
export function toPublicProfilePreview(profile: MyIntroductionResult): { match: Recommendation; detail: RecommendationDetailResult } {
  const detail: RecommendationDetailResult = {
    userUuid: profile.userUuid, name: profile.name ?? '내 프로필', age: profile.age,
    profileImageUrl: profile.profileImageUrl, syncRate: profile.syncRate, region: profile.region,
    job: profile.job, jobCertificationSubmitted: profile.jobCertificationSubmitted,
    selfIntroduction: profile.selfIntroduction, mbti: profile.mbti, mbtiAxisScores: profile.mbtiAxisScores,
    personalityTags: profile.personalityTags, voicePreview: profile.voicePreview,
  };
  const match: Recommendation = {
    userUuid: detail.userUuid, name: detail.name, age: detail.age, job: detail.job,
    jobCertificationSubmitted: detail.jobCertificationSubmitted, residence: detail.region,
    selfIntroduction: detail.selfIntroduction, mbti: detail.mbti, personalityTags: detail.personalityTags,
    profileImageUrl: detail.profileImageUrl,
    // 상대별 추천 점수는 본인 미리보기에서 표시하지 않는다.
    recommendationScore: 0,
  };
  return { match, detail };
}
