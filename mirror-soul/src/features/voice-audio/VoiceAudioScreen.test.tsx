import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { VoiceAudioScreen } from './VoiceAudioScreen';

const mockChange = jest.fn();
const mockSetGain = jest.fn();
jest.mock('@/src/store/useVoiceAudioStore', () => ({ useVoiceAudioStore: (selector: (state: unknown) => unknown) => selector({ callVoiceGain: 1, setCallVoiceGain: mockSetGain }) }));
const mockRefetch = jest.fn();
let mockSettings = { volume: 50 as number | null, isLoading: false, isError: false, isSaving: false };
jest.mock('./hooks/useVoiceAudioSettings', () => ({ useVoiceAudioSettings: () => ({ ...mockSettings, handleVolumeChange: mockChange, refetch: mockRefetch }) }));
jest.mock('./components/AudioCheck', () => ({ AudioCheck: () => null }));
jest.mock('./components/MicrophonePermission', () => ({ MicrophonePermission: () => null }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: () => {} }));
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), canGoBack: () => true }) }));
jest.mock('@/src/components/common/ScreenLayout', () => ({ ScreenLayout: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock('@/src/components/common/Header', () => ({ Header: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
beforeEach(() => { jest.clearAllMocks(); mockSettings = { volume: 50, isLoading: false, isError: false, isSaving: false }; });

it('offers volume adjustment and sound preparation without a speed control', () => {
  const screen = render(<VoiceAudioScreen />);
  fireEvent.press(screen.getByLabelText('목소리 크기 키우기'));
  expect(mockChange).toHaveBeenCalledWith(60);
  fireEvent.press(screen.getByLabelText('목소리 작게'));
  expect(mockChange).toHaveBeenCalledWith(25);
  expect(screen.getByText('소리 확인')).toBeTruthy();
  expect(screen.getByText('마이크 사용')).toBeTruthy();
  expect(screen.queryByText(/말하기 속도/)).toBeNull();
});

it('offers retry after a settings error without allowing speculative edits', () => {
  mockSettings = { ...mockSettings, volume: null, isError: true };
  const screen = render(<VoiceAudioScreen />);
  expect(screen.getByLabelText('목소리 보통')).toBeDisabled();
  fireEvent.press(screen.getByLabelText('소리 설정 다시 불러오기'));
  expect(mockRefetch).toHaveBeenCalledTimes(1);
});


it('offers local call gain without making a backend settings update', () => {
  const screen = render(<VoiceAudioScreen />);
  fireEvent.press(screen.getByLabelText('통화 음성 1.5배'));
  expect(mockSetGain).toHaveBeenCalledWith(1.5);
  fireEvent.press(screen.getByLabelText('통화 음성 2배'));
  expect(mockSetGain).toHaveBeenLastCalledWith(2);
  expect(mockChange).not.toHaveBeenCalled();
});
