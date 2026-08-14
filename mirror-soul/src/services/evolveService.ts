import apiClient from './apiClient';
import {
  CompleteVoiceUpdateRequest,
  TwinSyncResponse,
  ValueBalanceAnswerRequest,
  ValueBalanceAnswerResponse,
  ValueBalanceChosenSide,
  ValueBalanceQuestionResponse,
  VoiceTrainingSentenceResponse,
  VoiceUpdateJobResponse,
} from '../types/api/evolve';
import { logger } from '../utils/logger';

/**
 * 성장(Evolve) 도메인 API 서비스 (SoC)
 */

/** 트윈 유사도(Sync Rate) 조회 */
export const getTwinSync = async (): Promise<TwinSyncResponse> => {
  logger.debug('getTwinSync');
  try {
    const response = await apiClient.get<TwinSyncResponse>('/evolve');
    logger.info('getTwinSync SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getTwinSync ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 목소리 정밀 학습용 낭독 문장 조회 (호출마다 랜덤 문장 + sentenceId 반환) */
export const getVoiceTrainingSentence = async (): Promise<VoiceTrainingSentenceResponse> => {
  logger.debug('getVoiceTrainingSentence');
  try {
    const response = await apiClient.get<VoiceTrainingSentenceResponse>('/evolve/voice');
    logger.info('getVoiceTrainingSentence SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getVoiceTrainingSentence ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 목소리 정밀 학습 녹음 완료 - 업로드된 오디오로 학습 Job 등록 */
export const completeVoiceUpdate = async (
  data: CompleteVoiceUpdateRequest
): Promise<VoiceUpdateJobResponse> => {
  logger.debug('completeVoiceUpdate:', { sentenceId: data.sentenceId, objectKey: data.audioObjectKey });
  try {
    const response = await apiClient.post<VoiceUpdateJobResponse>('/evolve/voice', data);
    logger.info('completeVoiceUpdate SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('completeVoiceUpdate ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 가치관 밸런스 게임 - 오늘의 질문 조회. 일일 quota 소진 시 result가 null로 온다(에러 아님). */
export const getValueBalanceQuestion = async (): Promise<ValueBalanceQuestionResponse> => {
  logger.debug('getValueBalanceQuestion');
  try {
    const response = await apiClient.get<ValueBalanceQuestionResponse>('/evolve/value-balance');
    logger.info('getValueBalanceQuestion SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getValueBalanceQuestion ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 가치관 밸런스 게임 - 답변 제출 */
export const submitValueBalanceAnswer = async (
  questionId: number,
  chosenSide: ValueBalanceChosenSide
): Promise<ValueBalanceAnswerResponse> => {
  logger.debug('submitValueBalanceAnswer:', { questionId, chosenSide });
  const body: ValueBalanceAnswerRequest = { chosenSide };
  try {
    const response = await apiClient.post<ValueBalanceAnswerResponse>(
      `/evolve/value-balance/${questionId}/answer`,
      body
    );
    logger.info('submitValueBalanceAnswer SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('submitValueBalanceAnswer ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
