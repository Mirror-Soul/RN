import { useState, useCallback } from 'react';
import { INTERVIEW_QUESTIONS } from '../constants/interviewQuestions';

export function useInterviewQuestions() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const totalQuestions = INTERVIEW_QUESTIONS.length;
  const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

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
