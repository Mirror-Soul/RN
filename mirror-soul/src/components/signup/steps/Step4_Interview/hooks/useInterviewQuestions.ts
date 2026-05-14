import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInterviewQuestions } from '@/src/services/onboardingService';
import { InterviewQuestion } from '../types/interview';

const FALLBACK_QUESTION: InterviewQuestion = {
  id: -1,
  category: '',
  question: '질문을 불러오는 중입니다...',
};

export function useInterviewQuestions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // React Query를 통한 인터뷰 질문 동적 패칭
  const { 
    data: questions = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['interviewQuestions'],
    queryFn: getInterviewQuestions,
    staleTime: 1000 * 60 * 30, // 30분간 fresh 상태 유지 (회원가입 세션 동안 충분)
    gcTime: 1000 * 60 * 60,     // 1시간 동안 캐시 유지 (뒤로가기 대응)
  });

  const totalQuestions = questions.length || 5; // 서버 데이터가 올 때까지 기본값 5 유지
  const currentQuestion: InterviewQuestion = questions[currentQuestionIndex] ?? FALLBACK_QUESTION;
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  const goToNextQuestion = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion]);

  return {
    currentQuestionIndex,
    currentQuestion,
    totalQuestions,
    isLastQuestion,
    goToNextQuestion,
    isLoading,
    isError,
    refetch,
  };
}
