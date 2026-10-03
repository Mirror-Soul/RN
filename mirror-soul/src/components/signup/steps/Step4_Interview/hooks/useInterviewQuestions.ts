import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInterviewQuestions } from '@/src/services/onboardingService';

export function useInterviewQuestions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const query = useQuery({
    queryKey: ['interviewQuestions'],
    queryFn: async () => {
      const questions = await getInterviewQuestions();
      if (!questions.length || questions.some(question => !Number.isInteger(question.id) || question.id <= 0 || !question.question.trim()) || new Set(questions.map(question => question.id)).size !== questions.length) {
        throw new Error('질문을 준비하지 못했어요. 잠시 후 다시 불러와주세요.');
      }
      return questions;
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
  const totalQuestions = query.data?.length ?? 0;
  const currentQuestion = query.data?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const goToNextQuestion = useCallback(() => setCurrentQuestionIndex(index => Math.min(index + 1, totalQuestions - 1)), [totalQuestions]);
  return {
    currentQuestion, currentQuestionIndex, totalQuestions, isLastQuestion, goToNextQuestion,
    isLoading: query.isPending, isError: query.isError, refetch: query.refetch,
  };
}
