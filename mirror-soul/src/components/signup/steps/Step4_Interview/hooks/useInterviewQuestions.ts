import { useState, useCallback } from 'react';
import { INTERVIEW_QUESTIONS } from '../constants/interviewQuestions';
import { InterviewQuestion } from '../types/interview';

const FALLBACK_QUESTION: InterviewQuestion = {
  id: -1,
  category: '로딩 중',
  question: '질문을 불러오고 있습니다...',
};

export function useInterviewQuestions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const totalQuestions = INTERVIEW_QUESTIONS.length;
  const currentQuestion: InterviewQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex] ?? FALLBACK_QUESTION;
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
  };
}
