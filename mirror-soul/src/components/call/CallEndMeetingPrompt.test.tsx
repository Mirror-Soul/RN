import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
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
