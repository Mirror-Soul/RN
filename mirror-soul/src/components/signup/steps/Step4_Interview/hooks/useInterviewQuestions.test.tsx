import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getInterviewQuestions } from '@/src/services/onboardingService';
import { useInterviewQuestions } from './useInterviewQuestions';
jest.mock('@/src/services/onboardingService', () => ({ getInterviewQuestions: jest.fn() }));
let client: QueryClient;
function setup() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return renderHook(() => useInterviewQuestions(), { wrapper: ({ children }: React.PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
beforeEach(() => jest.resetAllMocks());
afterEach(() => client?.clear());

it.each([
  [],
  [{ id: -1, question: '질문' }],
  [{ id: 1, question: '  ' }],
  [{ id: 1, question: '질문' }, { id: 1, question: '다른 질문' }],
])('never exposes a fallback submit ID for invalid server questions: %j', async (...rows) => {
  // jest.each treats each inner array as an argument list.
  (getInterviewQuestions as jest.Mock).mockResolvedValue(rows);
  const { result } = setup();
  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.currentQuestion).toBeUndefined();
  expect(result.current.totalQuestions).toBe(0);
});

it('uses the actual question count and bounds the last question', async () => {
  (getInterviewQuestions as jest.Mock).mockResolvedValue([{ id: 17, question: '질문 하나', category: '' }, { id: 25, question: '질문 둘', category: '' }]);
  const { result } = setup();
  await waitFor(() => expect(result.current.currentQuestion?.id).toBe(17));
  expect(result.current.totalQuestions).toBe(2);
  act(() => result.current.goToNextQuestion());
  expect(result.current.currentQuestion?.id).toBe(25);
  expect(result.current.isLastQuestion).toBe(true);
  act(() => result.current.goToNextQuestion());
  expect(result.current.currentQuestion?.id).toBe(25);
});
