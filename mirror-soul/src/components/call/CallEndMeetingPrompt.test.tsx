import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CallEndMeetingPrompt from './CallEndMeetingPrompt';

const mockSend = jest.fn();
jest.mock('@/src/features/match/hooks/useCreateMeetingRequestMutation', () => ({
  useCreateMeetingRequestMutation: () => ({
    mutateAsync: mockSend,
    isPending: false,
  }),
}));
jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: jest.requireActual('@/src/constants/theme').lightTheme,
  }),
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 34, left: 0, right: 0 }),
}));

it('returns to the existing received request without offering a duplicate request', () => {
  const onClose = jest.fn();
  const screen = render(
    <CallEndMeetingPrompt
      partnerName="지민"
      partnerUserUuid="sender"
      completedCall={{
        callId: 12,
        durationSec: 30,
        status: 'COMPLETED',
        remainingTalkTime: 60,
      }}
      endedByTimeLimit={false}
      hasReceivedRequest
      onClose={onClose}
    />,
  );
  expect(screen.queryByPlaceholderText(/지민님/)).toBeNull();
  fireEvent.press(screen.getByLabelText('받은 신청으로 돌아가기'));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(mockSend).not.toHaveBeenCalled();
});

const completedCall = { callId: 12, durationSec: 30, status: 'COMPLETED' as const, remainingTalkTime: 60 };
const renderPrompt = (props: Partial<React.ComponentProps<typeof CallEndMeetingPrompt>> = {}) => render(
  <CallEndMeetingPrompt partnerName="지민" partnerUserUuid="sender" completedCall={completedCall} endedByTimeLimit={false} onClose={jest.fn()} {...props} />,
);

it('offers the record of the call that just ended and warns that it may take a few seconds to fill in', () => {
  const onViewHistory = jest.fn();
  const screen = renderPrompt({ onViewHistory });
  fireEvent.press(screen.getByLabelText('통화 기록 보기'));
  expect(onViewHistory).toHaveBeenCalledTimes(1);
  expect(screen.getByText('방금 나눈 대화는 정리되는 데 몇 초 걸릴 수 있어요.')).toBeTruthy();
});

it('does not draw a dead record link when no destination is provided', () => {
  const screen = renderPrompt();
  expect(screen.queryByLabelText('통화 기록 보기')).toBeNull();
});

it('keeps the record link after a request exists or has just been sent', async () => {
  const onViewHistory = jest.fn();
  const received = renderPrompt({ onViewHistory, hasReceivedRequest: true });
  fireEvent.press(received.getByLabelText('통화 기록 보기'));
  expect(onViewHistory).toHaveBeenCalledTimes(1);
  received.unmount();

  mockSend.mockResolvedValue({});
  const compose = renderPrompt({ onViewHistory });
  fireEvent.changeText(compose.getByLabelText('만남 신청 메시지'), '안녕하세요');
  fireEvent.press(compose.getByLabelText('만남 신청 보내기'));
  await waitFor(() => expect(compose.getByText('만남 신청을 보냈어요')).toBeTruthy());
  fireEvent.press(compose.getByLabelText('통화 기록 보기'));
  expect(onViewHistory).toHaveBeenCalledTimes(2);
});
