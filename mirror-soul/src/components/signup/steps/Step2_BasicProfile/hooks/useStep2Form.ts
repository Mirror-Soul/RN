import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Step2State } from '../types/step2';
import { checkNicknameDuplicate } from '@/src/services/onboardingService';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { jobCategories } from '../Professional/jobData';


/**
 * useStep2Form 훅
 * 회원가입 2단계의 모든 폼 로직과 상태를 캡슐화합니다. (SRP)
 */
export function useStep2Form() {
  const [state, setState] = useState<Step2State>({
    nickname: '',
    isNicknameVerified: false,
    isNicknameChecking: false,
    sidoName: '',
    sigunguName: '',
    eupmyeondongName: '',
    jobCategory: '',
    jobTitle: '',
    isJobVerifying: false,
    isJobVerified: false,
    jobCertificationObjectKey: null,
  });

  // 지역 데이터 캐시 (성능 최적화: 드롭다운이 닫혀도 유지)
  const sigunguCache = useRef<Map<string, string[]>>(new Map());
  const eupmyeondongCache = useRef<Map<string, string[]>>(new Map());

  // 폼 업데이트 함수
  const updateState = useCallback((updates: Partial<Step2State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 닉네임 중복 확인 처리
  const handleNicknameCheck = useCallback(async () => {
    if (state.nickname.length < 2) {
      Alert.alert('알림', '닉네임은 2자 이상 입력해주세요.');
      return;
    }
    if (state.isNicknameChecking) return;

    try {
      updateState({ isNicknameChecking: true });
      const response = await checkNicknameDuplicate({ nickname: state.nickname.trim() });

      // 백엔드는 사용 가능/중복 두 경우 모두 isSuccess: true로 응답한다(실패는 네트워크/서버
      // 에러 때만) — 실제 사용 가능 여부는 response.result.available로 판단해야 한다.
      if (response.result?.available) {
        updateState({ isNicknameVerified: true });
      } else {
        Alert.alert('닉네임 중복', '이미 사용 중인 닉네임입니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error?.message || '닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      updateState({ isNicknameChecking: false });
    }
  }, [state.nickname, state.isNicknameChecking, updateState]);

  // 직업 인증 처리 (S3 업로드 로직 포함)
  const handleJobVerify = useCallback(async (fileUri: string, contentType: string, fileName: string) => {
    if (state.isJobVerifying) return;

    try {
      updateState({ isJobVerifying: true });

      // 1. Presigned URL 발급
      const presignedResponse = await getPresignedUrl({
        fileName,
        contentType,
        directory: 'job-certifications',
      });

      if (!presignedResponse.isSuccess) {
        const errorMsg = presignedResponse.message || '업로드 주소 발급에 실패했습니다.';
        const errorCode = presignedResponse.code ? ` (${presignedResponse.code})` : '';
        throw new Error(`${errorMsg}${errorCode}`);
      }

      const { presignedUrl, objectKey } = presignedResponse.result;

      // 2. S3 직접 업로드
      await uploadFileToS3(presignedUrl, fileUri, contentType);

      // 3. 상태 업데이트
      updateState({ 
        isJobVerified: true,
        jobCertificationObjectKey: objectKey 
      });
      
      Alert.alert('성공', '직업 인증 서류가 업로드되었습니다.');
    } catch (error: any) {
      Alert.alert('업로드 실패', error?.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      updateState({ isJobVerifying: false });
    }
  }, [state.isJobVerifying, updateState]);

  // 다음 단계 이동 가능 여부 체크 (SoC: 도메인 검증 로직 통합)
  // 조건: 닉네임 중복 확인 완료, 지역 선택 완료, 유효한 직군 선택 완료
  const isFormValid = 
    state.isNicknameVerified && 
    state.sidoName !== '' && 
    state.sigunguName !== '' && 
    state.eupmyeondongName !== '' && 
    jobCategories.some((j) => j.value === state.jobCategory);

  return {
    state,
    updateState,
    handleNicknameCheck,
    handleJobVerify,
    isFormValid,
    sigunguCache,
    eupmyeondongCache,
  };
}
