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
  SaveFaceScanRequest,
  SaveFaceScanResponse,
} from '../types/api/onboarding';
import { InterviewQuestion } from '../components/signup/steps/Step4_Interview/types/interview';
import apiClient from './apiClient';
import { logger } from '../utils/logger';

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
  job: JobEnum,
  data: SaveProfileRequest
): Promise<SaveProfileResponse> => {
  try {
    const response = await apiClient.post<SaveProfileResponse>(
      `/onboarding/profile`,
      data,
      {
        params: { job },
      }
    );
    logger.debug('saveProfile SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('saveProfile ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 성격 유형 설정 (저장) */
export const savePersonality = async (
  data: SavePersonalityRequest
): Promise<SavePersonalityResponse> => {
  try {
    const response = await apiClient.put<SavePersonalityResponse>(
      `/onboarding/personality`,
      data
    );
    logger.debug('savePersonality SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('savePersonality ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 인터뷰 응답 저장 */
export const saveInterviewAnswer = async (
  data: SaveInterviewAnswerRequest
): Promise<SaveInterviewAnswerResponse> => {
  const url = `/onboarding/interview/answers`;
  
  logger.debug('saveInterviewAnswer:', { 
    url,
    interviewIdType: typeof data.interviewId,
    hasAnswer: Boolean(data.answerText),
    answerLength: data.answerText?.length ?? 0,
  });
  
  try {
    const response = await apiClient.post<SaveInterviewAnswerResponse>(url, data);
    logger.info('saveInterviewAnswer SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('saveInterviewAnswer ERROR:', {
      message: error instanceof Error ? error.message : String(error),
      serverError: (error as any)?.error,
      interviewId: data.interviewId
    });
    throw error;
  }
};

/** 인터뷰 질문 전체 조회 및 데이터 변환 (Adapter Pattern) */
export const getInterviewQuestions = async (): Promise<InterviewQuestion[]> => {
  const response = await apiClient.get<GetInterviewQuestionsResponse>('/onboarding/interview/questions');
  const data = response.data;

  if (!data.isSuccess || !data.result?.questions) {
    throw new Error(data.message || '인터뷰 질문을 불러오지 못했습니다.');
  }

  // 데이터 유효성 검증 (최소주의: 질문 5개 보장 확인)
  if (data.result.questions.length !== 5) {
    logger.warn(`[Validation] Expected 5 questions, but received ${data.result.questions.length}`);
  }

  // Adapter Pattern: 서버의 questionId를 앱 내부용 id로 변환
  // 카테고리는 현재 주석 처리 요구사항에 따라 빈 문자열로 초기화
  return data.result.questions.map((item) => ({
    id: item.questionId,
    category: '', // 추후 백엔드 연동 시 업데이트 예정
    question: item.question,
  }));
};

/** 얼굴 스캔 영상 데이터 저장 */
export const saveFaceScan = async (
  data: SaveFaceScanRequest
): Promise<SaveFaceScanResponse> => {
  const url = `/onboarding/visual`;
  
  logger.debug('saveFaceScan:', { 
    url,
  });
  
  try {
    const response = await apiClient.post<SaveFaceScanResponse>(url, data);
    logger.info('saveFaceScan SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('saveFaceScan ERROR:', {
      message: error instanceof Error ? error.message : String(error),
      serverError: (error as any)?.error,
    });
    throw error;
  }
};
