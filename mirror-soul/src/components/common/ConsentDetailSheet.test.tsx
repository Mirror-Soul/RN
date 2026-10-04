import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { ConsentDetailSheet } from './ConsentDetailSheet';

let mockHeight = 852;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => ({ width: 393, height: mockHeight, fontScale: 2, scale: 3 }) }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('./BottomSheet/BottomSheet', () => ({ BottomSheet: ({ children, height, onClose, dragFromHandleOnly }: { children: React.ReactNode; height: number; onClose: () => void; dragFromHandleOnly: boolean }) => {
  const { View, Pressable, Text } = jest.requireActual('react-native');
  return <View testID="sheet" style={{ height }} accessibilityHint={dragFromHandleOnly ? 'handle-only' : 'whole-sheet'}>
    {children}<Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="배경으로 닫기"><Text>닫기</Text></Pressable>
  </View>;
} }));

beforeEach(() => { mockHeight = 852; });

it('adapts the consent sheet to rotation and lets its long heading scroll with the content', () => {
  const props = { visible: true, onClose: jest.fn(), title: '생체정보 수집 및 AI 트윈 활용 동의', content: '긴 약관 내용' };
  const screen = render(<ConsentDetailSheet {...props} />);
  expect(screen.getByTestId('sheet').props.style.height).toBe(639);
  mockHeight = 393;
  screen.rerender(<ConsentDetailSheet {...props} />);
  expect(screen.getByTestId('sheet').props.style.height).toBe(294.75);
  expect(screen.getByTestId('sheet').props.accessibilityHint).toBe('handle-only');
  const body = within(screen.UNSAFE_getByType(ScrollView));
  expect(body.getByRole('header')).toBeTruthy();
  expect(body.queryByRole('button', { name: '확인했습니다' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: '확인했습니다' }));
  expect(props.onClose).toHaveBeenCalledTimes(1);
});

it('does not agree when dismissed with the background, and confirms once with the action', () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const screen = render(<ConsentDetailSheet visible onClose={onClose} onConfirm={onConfirm} title="약관" content="내용" />);
  fireEvent.press(screen.getByRole('button', { name: '배경으로 닫기' }));
  expect(onConfirm).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: '확인했습니다' }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(2);
});
