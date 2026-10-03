import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { assertPhotoEditorAvailable, normalizeSelectedPhoto, PhotoPreparationError } from './prepareProfilePhoto';
import { ProfilePhotoManager } from './ProfilePhotoManager';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { useProfilePhotoMutation } from './useProfilePhotoMutation';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { useRegisteredPhotoPreview } from './registeredPhotoPreview';
import { ProfilePhoto } from './ProfilePhoto';

jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('../hooks/useProfileQuery', () => ({ useProfileQuery: jest.fn() }));
jest.mock('./useProfilePhotoMutation', () => ({ useProfilePhotoMutation: jest.fn() }));
jest.mock('./registeredPhotoPreview', () => ({ useRegisteredPhotoPreview: jest.fn() }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => ({ userUuid: 'me', isLoggedIn: true }), subscribe: () => jest.fn() } }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn() } }));
jest.mock('./ProfilePhoto', () => ({ ProfilePhoto: () => null }));
jest.mock('./ProfilePhotoEditor', () => ({
  ProfilePhotoEditor: ({ photo, onClose, onSaved }: { photo: { uri: string }; onClose: () => void; onSaved: () => void }) => {
    const React = jest.requireActual('react');
    const { View, Text, Pressable } = jest.requireActual('react-native');
    return React.createElement(View, null,
      React.createElement(Text, null, `사진 편집: ${photo.uri}`),
      React.createElement(Pressable, { accessibilityRole: 'button', accessibilityLabel: '편집기 등록 성공', onPress: () => { onClose(); onSaved(); } }, React.createElement(Text, null, '등록 성공')));
  },
}));
jest.mock('./prepareProfilePhoto', () => ({ ...jest.requireActual('./prepareProfilePhoto'), assertPhotoEditorAvailable: jest.fn(), normalizeSelectedPhoto: jest.fn() }));

const toast = jest.fn();
const remove = jest.fn();
const refetch = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  (useProfileQuery as jest.Mock).mockReturnValue({ data: { profileImageUrl: null }, isError: false, isLoading: false, refetch });
  (useRegisteredPhotoPreview as jest.Mock).mockReturnValue(null);
  (useProfilePhotoMutation as jest.Mock).mockReturnValue({ isPending: false, remove });
  (useToast as jest.Mock).mockReturnValue({ showToast: toast });
  (assertPhotoEditorAvailable as jest.Mock).mockResolvedValue(undefined);
  (normalizeSelectedPhoto as jest.Mock).mockResolvedValue({ uri: 'file:///normalized.jpg', width: 800, height: 1000 });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

it('shows the confirmed local preview when initial profile data is still unavailable', () => {
  (useProfileQuery as jest.Mock).mockReturnValue({ data: undefined, isError: false, isLoading: true, refetch });
  (useRegisteredPhotoPreview as jest.Mock).mockReturnValue({ url: 'https://bucket/new.jpg', uri: 'file:///registered.jpg' });
  const screen = render(<ProfilePhotoManager signup name="소울" />);
  expect(screen.getByText('사진 등록됨')).toBeTruthy();
  expect(screen.UNSAFE_getByType(ProfilePhoto).props).toMatchObject({ uri: 'https://bucket/new.jpg', previewUri: 'file:///registered.jpg' });
});

it('does not show a local copy after the server reports a deletion or a different photo', () => {
  (useRegisteredPhotoPreview as jest.Mock).mockReturnValue({ url: 'https://bucket/old.jpg', uri: 'file:///old.jpg' });
  const screen = render(<ProfilePhotoManager signup name="소울" />);
  expect(screen.UNSAFE_getByType(ProfilePhoto).props.previewUri).toBeNull();
  expect(screen.queryByText('사진 등록됨')).toBeNull();
  (useProfileQuery as jest.Mock).mockReturnValue({ data: { profileImageUrl: 'https://bucket/new.jpg' }, refetch });
  screen.rerender(<ProfilePhotoManager signup name="소울" />);
  expect(screen.UNSAFE_getByType(ProfilePhoto).props.previewUri).toBeNull();
});

it('refreshes the server URL and retries the image explicitly without blocking change or delete', () => {
  (useProfileQuery as jest.Mock).mockReturnValue({ data: { profileImageUrl: 'https://bucket/photo.jpg' }, isError: true, isLoading: false, refetch });
  const screen = render(<ProfilePhotoManager signup name="소울" />);
  const first = screen.UNSAFE_getByType(ProfilePhoto);
  act(() => first.props.onLoadStateChange('error'));
  fireEvent.press(screen.getByLabelText('등록된 프로필 사진 다시 불러오기'));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(screen.UNSAFE_getByType(ProfilePhoto)).not.toBe(first);
  expect(screen.getByLabelText('프로필 사진 변경')).toBeEnabled();
  expect(screen.getByLabelText('프로필 사진 삭제')).toBeEnabled();
});
afterEach(() => jest.restoreAllMocks());

async function selectFromAlbum() {
  const screen = render(<ProfilePhotoManager signup name="소울" />);
  fireEvent.press(screen.getByLabelText('프로필 사진 추가'));
  const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
  await act(async () => { buttons.find((button: { text: string }) => button.text === '앨범에서 선택').onPress(); });
  return screen;
}

it('opens the editor after a valid selection without saving the photo', async () => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///selected.heic' }] });
  const screen = await selectFromAlbum();
  await waitFor(() => expect(screen.getByText('사진 편집: file:///normalized.jpg')).toBeTruthy());
  expect(normalizeSelectedPhoto).toHaveBeenCalledWith('file:///selected.heic');
  expect(toast).not.toHaveBeenCalled();
});

it.each([undefined, { canceled: false }, { canceled: false, assets: [] }, { canceled: false, assets: [{}] }])('shows a helpful message for an empty picker result (%p)', async result => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(result);
  const screen = await selectFromAlbum();
  await waitFor(() => expect(screen.getByText('선택한 사진을 불러오지 못했어요. 다른 사진을 선택해 주세요.')).toBeTruthy());
  expect(normalizeSelectedPhoto).not.toHaveBeenCalled();
  expect(screen.getByLabelText('프로필 사진 추가')).toBeEnabled();
});

it('silently returns after cancelling the picker', async () => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });
  const screen = await selectFromAlbum();
  await waitFor(() => expect(screen.getByText('사진 추가하기')).toBeTruthy());
  expect(screen.queryByRole('alert')).toBeNull();
  expect(normalizeSelectedPhoto).not.toHaveBeenCalled();
});

it('handles unavailable native editing before opening the picker and leaves signup available', async () => {
  (assertPhotoEditorAvailable as jest.Mock).mockRejectedValue(new PhotoPreparationError('사진 편집 기능을 사용할 수 없어요. 앱을 업데이트한 뒤 다시 시도해 주세요.'));
  const screen = await selectFromAlbum();
  await waitFor(() => expect(screen.getByText(/앱을 업데이트/)).toBeTruthy());
  expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  expect(screen.getByText(/지금은 건너뛰어도 괜찮아요/)).toBeTruthy();
});

it('keeps raw native exceptions out of the user-facing copy', async () => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///selected.jpg' }] });
  (normalizeSelectedPhoto as jest.Mock).mockRejectedValue(new TypeError("Cannot read property 'width' of undefined"));
  const screen = await selectFromAlbum();
  await waitFor(() => expect(screen.getByText('사진을 불러오지 못했어요. 다른 사진을 선택해 주세요.')).toBeTruthy());
  expect(screen.queryByText(/Cannot read property/)).toBeNull();
});

it('shows a short success notification after the editor closes', async () => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///selected.jpg' }] });
  const screen = await selectFromAlbum();
  await waitFor(() => expect(screen.getByLabelText('편집기 등록 성공')).toBeTruthy());
  fireEvent.press(screen.getByLabelText('편집기 등록 성공'));
  expect(screen.queryByText('사진 편집: file:///normalized.jpg')).toBeNull();
  expect(toast).toHaveBeenCalledWith('프로필 사진을 등록했어요.', 'success');
});

it('shows a registered status without encouraging an already registered user to skip', () => {
  (useProfileQuery as jest.Mock).mockReturnValue({ data: { profileImageUrl: 'https://bucket/photo.jpg' }, isError: false, isLoading: false });
  const screen = render(<ProfilePhotoManager signup name="소울" />);
  expect(screen.getByText('사진 등록됨')).toBeTruthy();
  expect(screen.queryByText(/지금은 건너뛰어도/)).toBeNull();
});

it('confirms deletion only after the mutation succeeds', async () => {
  (useProfileQuery as jest.Mock).mockReturnValue({ data: { profileImageUrl: 'https://bucket/photo.jpg' }, isError: false, isLoading: false });
  remove.mockResolvedValue(null);
  const screen = render(<ProfilePhotoManager name="소울" />);
  fireEvent.press(screen.getByLabelText('프로필 사진 삭제'));
  const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
  expect(toast).not.toHaveBeenCalled();
  await act(async () => { await buttons.find((button: { text: string }) => button.text === '삭제').onPress(); });
  expect(toast).toHaveBeenCalledWith('프로필 사진을 삭제했어요.', 'success');
});

it('keeps the registered state and shows an error when deletion fails', async () => {
  (useProfileQuery as jest.Mock).mockReturnValue({ data: { profileImageUrl: 'https://bucket/photo.jpg' }, isError: false, isLoading: false });
  remove.mockRejectedValueOnce(new Error('네트워크 연결을 확인해 주세요.'));
  const screen = render(<ProfilePhotoManager name="소울" />);
  fireEvent.press(screen.getByLabelText('프로필 사진 삭제'));
  const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
  await act(async () => { await buttons.find((button: { text: string }) => button.text === '삭제').onPress(); });
  expect(screen.getByText('사진 등록됨')).toBeTruthy();
  expect(screen.getByText('네트워크 연결을 확인해 주세요.')).toBeTruthy();
  expect(toast).not.toHaveBeenCalled();
});
