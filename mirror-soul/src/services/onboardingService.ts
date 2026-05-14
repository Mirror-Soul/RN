import {
  CheckNicknameRequest,
  CheckNicknameResponse,
  GetEupmyeondongRequest,
  GetEupmyeondongResponse,
  GetSidoResponse,
  GetSigunguRequest,
  GetSigunguResponse,
  JobEnum,
  SaveProfileRequest,
  SaveProfileResponse,
  SavePersonalityRequest,
  SavePersonalityResponse,
  SaveInterviewAnswerRequest,
  SaveInterviewAnswerResponse,
  GetInterviewQuestionsResponse,
} from '../types/api/onboarding';
import { InterviewQuestion } from '../components/signup/steps/Step4_Interview/types/interview';
import apiClient from './apiClient';

/**
 * 온보딩 도메인 API 서비스 (SoC: 온보딩 비즈니스 로직 분리)
 */

/** 닉네임 중복 확인 */
export const checkNicknameDuplicate = async (
  data: CheckNicknameRequest
): Promise<CheckNicknameResponse> => {
  const response = await apiClient.post<CheckNicknameResponse>(
    '/onboarding/profile/check-dup-nickname',
    data
  );
  return response.data;
};

/** 지역 조회 - 시도 */
export const getSidoList = async (): Promise<GetSidoResponse> => {
  const response = await apiClient.get<GetSidoResponse>('/onboarding/regions/sido');
  return response.data;
};

/** 지역 조회 - 시군구 */
export const getSigunguList = async (
  params: GetSigunguRequest
): Promise<GetSigunguResponse> => {
  const response = await apiClient.get<GetSigunguResponse>('/onboarding/regions/sigungu', {
    params,
  });
  return response.data;
};

/** 지역 조회 - 읍면동 */
export const getEupmyeondongList = async (
  params: GetEupmyeondongRequest
): Promise<GetEupmyeondongResponse> => {
  const response = await apiClient.get<GetEupmyeondongResponse>(
    '/onboarding/regions/eupmyeondong',
    { params }
  );
  return response.data;
};

/** 프로필 설정 (최종 저장) */
export const saveProfile = async (
  userUuid: string,
  job: JobEnum,
  data: SaveProfileRequest
): Promise<SaveProfileResponse> => {
  console.log('[API Request] saveProfile:', { userUuid, job, data });
  const response = await apiClient.post<SaveProfileResponse>(
    `/onboarding/profile/${userUuid}`,
    data,
    {
      params: { job },
    }
  );
  console.log('[API Response] saveProfile:', response.data);
  return response.data;
};

/** 성격 유형 설정 (저장) */
export const savePersonality = async (
  userUuid: string,
  data: SavePersonalityRequest
): Promise<SavePersonalityResponse> => {
  console.log('[API Request] savePersonality:', { userUuid, data });
  const response = await apiClient.put<SavePersonalityResponse>(
    `/onboarding/personality/${userUuid}`,
    data
  );
  console.log('[API Response] savePersonality:', response.data);
  return response.data;
};

/** 인터뷰 응답 저장 */
export const saveInterviewAnswer = async (
  userUuid: string,
  data: SaveInterviewAnswerRequest
): Promise<SaveInterviewAnswerResponse> => {
  const url = `/onboarding/interview/answers/${userUuid}`;
  
  console.log('[API Request] saveInterviewAnswer:', { 
    url,
    userUuid, 
    data,
    interviewIdType: typeof data.interviewId 
  });
  
  try {
    const response = await apiClient.post<SaveInterviewAnswerResponse>(url, data);
    console.log('[API Response] saveInterviewAnswer SUCCESS:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[API Response] saveInterviewAnswer ERROR:', {
      code: error?.code,
      message: error?.message,
      serverError: error?.error,
      requestBody: data
    });
    throw error;
  }
};

/** 인터뷰 질문 전체 조회 및 데이터 변환 (Adapter Pattern) */
export const getInterviewQuestions = async (): Promise<InterviewQuestion[]> => {
  const response = await apiClient.get<GetInterviewQuestionsResponse>('/onboarding/interview/questions');
  const data = response.data;

  if (!data.isSuccess || !data.result.questions) {
    throw new Error(data.message || '인터뷰 질문을 불러오지 못했습니다.');
  }

  // 데이터 유효성 검증 (최소주의: 질문 5개 보장 확인)
  if (data.result.questions.length !== 5) {
    console.warn(`[Validation] Expected 5 questions, but received ${data.result.questions.length}`);
  }

  // Adapter Pattern: 서버의 questionId를 앱 내부용 id로 변환
  // 카테고리는 현재 주석 처리 요구사항에 따라 빈 문자열로 초기화
  return data.result.questions.map((item) => ({
    id: item.questionId,
    category: '', // 추후 백엔드 연동 시 업데이트 예정
    question: item.question,
  }));
};
