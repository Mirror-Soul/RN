import React from 'react';
import { Alert, PanResponder, StyleSheet } from 'react-native';
import * as ReactNative from 'react-native';
import type { PanResponderCallbacks } from 'react-native';
import { act, fireEvent, render, waitFor, within } from '@testing-library/react-native';
import { prepareProfilePhoto, rotateSelectedPhoto } from './prepareProfilePhoto';
import { useProfilePhotoMutation } from './useProfilePhotoMutation';
import { ProfilePhotoEditor } from './ProfilePhotoEditor';
import { DetailPhotoOverlay, CardPhotoOverlay } from './ProfilePhotoOverlays';
import { ProfilePhotoImage } from './ProfilePhotoImage';
import { PHOTO_PREVIEW_ASPECTS } from './profilePhotoPresentation';
import { CroppedPhotoPreview } from './CroppedPhotoPreview';

jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').Image }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn().mockResolvedValue(undefined) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').darkTheme, isDark: true }) }));
jest.mock('@/src/utils/logger', () => ({ logger: { warn: jest.fn() } }));
jest.mock('./useProfilePhotoMutation', () => ({ useProfilePhotoMutation: jest.fn() }));
jest.mock('./prepareProfilePhoto', () => ({ ...jest.requireActual('./prepareProfilePhoto'), prepareProfilePhoto: jest.fn(), rotateSelectedPhoto: jest.fn(), removePreparedPhoto: jest.fn().mockResolvedValue(undefined) }));

const photo = { uri: 'file:///source.jpg', width: 800, height: 1000 };
const prepared = { ...photo, uri: 'file:///cropped.jpg', size: 50000 };
const save = jest.fn();
let pan: PanResponderCallbacks;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(PanResponder, 'create').mockImplementation(callbacks => { pan = callbacks; return { panHandlers: {} }; });
  (useProfilePhotoMutation as jest.Mock).mockReturnValue({ isPending: false, stage: 'idle', save });
  (prepareProfilePhoto as jest.Mock).mockResolvedValue(prepared);
  save.mockResolvedValue('https://bucket/photo.jpg');
});
afterEach(() => jest.restoreAllMocks());

it('ignores gesture events without touches instead of reading pageX from undefined', () => {
  render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  expect(() => {
    pan.onPanResponderGrant?.({ nativeEvent: { touches: [] } } as never, {} as never);
    pan.onPanResponderMove?.({ nativeEvent: {} } as never, {} as never);
  }).not.toThrow();
});

it('prepares a preview first and saves only after pressing 사진 등록', async () => {
  const close = jest.fn();
  const saved = jest.fn();
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={close} onSaved={saved} />);
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('이렇게 보여요')).toBeTruthy());
  expect(save).not.toHaveBeenCalled();
  const crop = (prepareProfilePhoto as jest.Mock).mock.calls[0][1];
  expect(crop.originX).toBeGreaterThanOrEqual(0);
  expect(crop.originY).toBeGreaterThanOrEqual(0);
  expect(crop.originX + crop.width).toBeLessThanOrEqual(photo.width);
  expect(crop.originY + crop.height).toBeLessThanOrEqual(photo.height);
  fireEvent.press(screen.getByText('원형 사진'));
  expect(screen.getByRole('button', { name: '원형 사진', selected: true })).toBeTruthy();
  await act(async () => { fireEvent.press(screen.getByText('사진 등록')); });
  expect(save).toHaveBeenCalledWith(prepared);
  expect(close).toHaveBeenCalledTimes(1);
  expect(saved).toHaveBeenCalledTimes(1);
  expect(Alert.alert).not.toHaveBeenCalled();
});

it('keeps the preview on save failure and does not report a successful registration', async () => {
  save.mockRejectedValueOnce(new Error('네트워크 연결을 확인해 주세요.'));
  const close = jest.fn();
  const saved = jest.fn();
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={close} onSaved={saved} />);
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('사진 등록')).toBeTruthy());
  await act(async () => { fireEvent.press(screen.getByText('사진 등록')); });
  expect(screen.getByText('사진 등록 다시 시도')).toBeTruthy();
  expect(close).not.toHaveBeenCalled();
  expect(saved).not.toHaveBeenCalled();
  await act(async () => { fireEvent.press(screen.getByText('사진 등록 다시 시도')); });
  expect(save).toHaveBeenNthCalledWith(1, prepared);
  expect(save).toHaveBeenNthCalledWith(2, prepared);
  expect(prepareProfilePhoto).toHaveBeenCalledTimes(1);
  expect(saved).toHaveBeenCalledTimes(1);
});

it('shows both live previews and uses their updated crop for the final file', async () => {
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  expect(screen.getByLabelText('추천 카드 실시간 미리보기')).toBeTruthy();
  expect(screen.getByLabelText('원형 사진 실시간 미리보기')).toBeTruthy();
  const initialCrop = screen.UNSAFE_getAllByType(CroppedPhotoPreview)[0].props.crop;
  fireEvent.press(screen.getByLabelText('사진 확대'));
  const previews = screen.UNSAFE_getAllByType(CroppedPhotoPreview);
  expect(previews[0].props.crop.width).toBeLessThan(initialCrop.width);
  expect(previews[1].props.crop).toEqual(previews[0].props.crop);
  const finalCrop = previews[0].props.crop;
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('이렇게 보여요')).toBeTruthy());
  expect(prepareProfilePhoto).toHaveBeenCalledWith(photo.uri, finalCrop);
});

it('keeps rotation across preview and crops the rotated dimensions', async () => {
  const rotated = { uri: 'file:///rotated.jpg', width: 1000, height: 800 };
  (rotateSelectedPhoto as jest.Mock).mockResolvedValue(rotated);
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  await act(async () => { fireEvent.press(screen.getByLabelText('사진 90도 회전')); });
  expect(rotateSelectedPhoto).toHaveBeenCalledWith(photo.uri, 90);
  const cropped = screen.UNSAFE_getAllByType(CroppedPhotoPreview)[0].props.crop;
  expect(cropped.originX + cropped.width).toBeLessThanOrEqual(rotated.width);
  expect(cropped.originY + cropped.height).toBeLessThanOrEqual(rotated.height);
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('이렇게 보여요')).toBeTruthy());
  expect(prepareProfilePhoto).toHaveBeenCalledWith(rotated.uri, cropped);
  fireEvent.press(screen.getByText('구도 다시 맞추기'));
  expect(screen.UNSAFE_getAllByType(CroppedPhotoPreview)[0].props.photo).toEqual(rotated);
});

it('uses the original file for each quarter turn and restores it after four turns', async () => {
  (rotateSelectedPhoto as jest.Mock).mockImplementation(async (_uri, degrees) => ({ uri: `file:///rotate-${degrees}.jpg`, width: degrees === 180 ? 800 : 1000, height: degrees === 180 ? 1000 : 800 }));
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  for (let i = 0; i < 4; i++) await act(async () => { fireEvent.press(screen.getByLabelText('사진 90도 회전')); });
  expect((rotateSelectedPhoto as jest.Mock).mock.calls).toEqual([[photo.uri, 90], [photo.uri, 180], [photo.uri, 270]]);
  expect(screen.UNSAFE_getAllByType(CroppedPhotoPreview)[0].props.photo).toEqual(photo);
});

it('shows measured transfer progress separately from profile registration', () => {
  (useProfilePhotoMutation as jest.Mock).mockReturnValue({ isPending: true, stage: 'upload', uploadProgress: 0.42, save });
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  expect(screen.getByText('42% 전송')).toBeTruthy();
  expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(42);
  (useProfilePhotoMutation as jest.Mock).mockReturnValue({ isPending: true, stage: 'save', uploadProgress: 1, save });
  screen.rerender(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  expect(screen.getByText('전송 완료 · 프로필에 등록하고 있어요…')).toBeTruthy();
  expect(screen.queryByRole('progressbar')).toBeNull();
});

it('keeps the original photo and returns to editing from the preview', async () => {
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('이렇게 보여요')).toBeTruthy());
  fireEvent.press(screen.getByText('구도 다시 맞추기'));
  expect(screen.getByText('사진을 맞춰볼까요?')).toBeTruthy();
  expect(screen.getByLabelText('프로필 사진 크롭 영역')).toBeTruthy();
  expect(save).not.toHaveBeenCalled();
});

it('captures a vertical crop drag, keeps stable handlers, and restores scrolling after release', () => {
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('사진 확대'));
  const initialCrop = screen.UNSAFE_getAllByType(CroppedPhotoPreview)[0].props.crop;
  const handlers = pan;
  expect(handlers.onStartShouldSetPanResponderCapture?.({} as never, {} as never)).toBe(true);
  expect(handlers.onShouldBlockNativeResponder?.({} as never, {} as never)).toBe(true);
  act(() => handlers.onPanResponderGrant?.({ nativeEvent: { touches: [{ pageX: 100, pageY: 100 }] } } as never, {} as never));
  expect(screen.getByTestId('photo-editor-scroll').props.scrollEnabled).toBe(false);
  act(() => handlers.onPanResponderMove?.({ nativeEvent: { touches: [{ pageX: 100, pageY: 130 }] } } as never, {} as never));
  expect(screen.UNSAFE_getAllByType(CroppedPhotoPreview)[0].props.crop.originY).toBeLessThan(initialCrop.originY);
  expect(PanResponder.create).toHaveBeenCalledTimes(1);
  act(() => handlers.onPanResponderRelease?.({} as never, {} as never));
  expect(screen.getByTestId('photo-editor-scroll').props.scrollEnabled).toBe(true);
});

it('restores the surrounding scroll after a crop gesture is interrupted', () => {
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  act(() => pan.onPanResponderGrant?.({ nativeEvent: { touches: [{ pageX: 100, pageY: 100 }] } } as never, {} as never));
  expect(screen.getByTestId('photo-editor-scroll').props.scrollEnabled).toBe(false);
  act(() => pan.onPanResponderTerminate?.({} as never, {} as never));
  expect(screen.getByTestId('photo-editor-scroll').props.scrollEnabled).toBe(true);
});

it('sizes the crop from measured text and tool heights, keeping the footer outside the scroll', () => {
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  fireEvent(screen.getByTestId('photo-editor-scroll'), 'layout', { nativeEvent: { layout: { width: 320, height: 410 } } });
  fireEvent(screen.getByTestId('photo-editor-top'), 'layout', { nativeEvent: { layout: { height: 44 } } });
  fireEvent(screen.getByTestId('photo-editor-bottom'), 'layout', { nativeEvent: { layout: { height: 136 } } });
  const style = StyleSheet.flatten(screen.getByTestId('photo-editor-frame').props.style);
  expect(style.height + 44 + 136 + 40).toBeLessThanOrEqual(410);
  const scroll = screen.getByTestId('photo-editor-scroll');
  expect(within(scroll).queryByRole('button', { name: '미리보기 확인' })).toBeNull();
  expect(screen.getByRole('button', { name: '미리보기 확인' })).toBeEnabled();
});

it('keeps preview actions available with large text on a short screen', async () => {
  jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 2 });
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('사진 등록')).toBeTruthy());
  fireEvent(screen.getByTestId('photo-editor-scroll'), 'layout', { nativeEvent: { layout: { width: 320, height: 220 } } });
  fireEvent(screen.getByTestId('photo-editor-top'), 'layout', { nativeEvent: { layout: { height: 140 } } });
  fireEvent(screen.getByTestId('photo-editor-bottom'), 'layout', { nativeEvent: { layout: { height: 230 } } });
  expect(screen.getByTestId('photo-editor-scroll').props.scrollEnabled).toBe(true);
  for (const name of ['사진 등록', '구도 다시 맞추기']) {
    const button = screen.getByRole('button', { name });
    expect(button).toBeEnabled();
    expect(StyleSheet.flatten(button.props.style).flexBasis).toBe('auto');
    expect(within(screen.getByTestId('photo-editor-scroll')).queryByRole('button', { name })).toBeNull();
  }
});

// The prepared preview and public surfaces share the same final-file crop and overlays.
it('keeps each prepared preview centered and applies its public presentation ratio', async () => {
  const screen = render(<ProfilePhotoEditor photo={photo} name="소울" onClose={jest.fn()} />);
  fireEvent.press(screen.getByText('미리보기 확인'));
  await waitFor(() => expect(screen.getByText('이렇게 보여요')).toBeTruthy());
  for (const [tab, mode] of [['프로필', 'detail'], ['추천 카드', 'card'], ['원형 사진', 'avatar']] as const) {
    fireEvent.press(screen.getByRole('button', { name: tab }));
    const frame = StyleSheet.flatten(screen.getByTestId('photo-editor-frame').props.style);
    expect(frame.width / frame.height).toBeCloseTo(PHOTO_PREVIEW_ASPECTS[mode]);
    const preparedImage = screen.UNSAFE_getByType(ProfilePhotoImage);
    expect(preparedImage.props.source.uri).toBe(prepared.uri);
    if (mode === 'detail') expect(screen.UNSAFE_getByType(DetailPhotoOverlay).props.name).toBe('소울');
    if (mode === 'card') expect(screen.UNSAFE_getByType(CardPhotoOverlay)).toBeTruthy();
  }
});
