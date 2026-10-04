import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { AudioModule } from 'expo-audio';
import { MicrophonePermission } from './MicrophonePermission';

jest.mock('expo-audio', () => ({ AudioModule: { getRecordingPermissionsAsync: jest.fn(), requestRecordingPermissionsAsync: jest.fn() } }));
let mockRefresh!: () => Promise<unknown>;
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: (refresh: () => Promise<unknown>) => {
  mockRefresh = refresh;
  jest.requireActual('react').useEffect(() => { void refresh(); }, [refresh]);
} }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

it('checks permission without opening a microphone prompt until the user asks', async () => {
  (AudioModule.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
  (AudioModule.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: true });
  const screen = render(<MicrophonePermission />);
  await waitFor(() => expect(AudioModule.getRecordingPermissionsAsync).toHaveBeenCalled());
  expect(AudioModule.requestRecordingPermissionsAsync).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('마이크 사용 허용'));
  await waitFor(() => expect(screen.getByText('마이크 사용이 허용되어 있어요.')).toBeTruthy());
});

it('opens device settings when permission cannot be requested again', async () => {
  (AudioModule.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: false });
  const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  const screen = render(<MicrophonePermission />);
  fireEvent.press(await screen.findByLabelText('마이크 설정 열기'));
  await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
  expect(AudioModule.requestRecordingPermissionsAsync).not.toHaveBeenCalled();
});

it('lets an already-authorized user change permission and refreshes it after returning', async () => {
  (AudioModule.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: true });
  const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  const screen = render(<MicrophonePermission />);
  await screen.findByText('마이크 사용이 허용되어 있어요.');
  fireEvent.press(screen.getByLabelText('마이크 설정 열기'));
  await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
  expect(AudioModule.requestRecordingPermissionsAsync).not.toHaveBeenCalled();
  (AudioModule.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: false });
  await act(async () => { await mockRefresh(); });
  expect(screen.queryByText('마이크 사용이 허용되어 있어요.')).toBeNull();
  expect(screen.getByLabelText('마이크 설정 열기')).toBeTruthy();
  expect(screen.queryByLabelText('마이크 사용 허용')).toBeNull();
});

it('offers a manual settings path if opening OS settings fails', async () => {
  (AudioModule.getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: true });
  jest.spyOn(Linking, 'openSettings').mockRejectedValue(new Error('unavailable'));
  const screen = render(<MicrophonePermission />);
  await screen.findByText('마이크 사용이 허용되어 있어요.');
  fireEvent.press(screen.getByLabelText('마이크 설정 열기'));
  await screen.findByText('기기 설정을 열지 못했어요. 휴대폰 설정에서 Mirror Soul을 찾아주세요.');
});
