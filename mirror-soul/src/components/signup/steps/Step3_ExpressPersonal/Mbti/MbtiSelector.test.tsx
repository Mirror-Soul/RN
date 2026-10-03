import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import MbtiSelector from './MbtiSelector';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
const props = { onMbtiChange: jest.fn(), onScoresChange: jest.fn() };
beforeEach(() => jest.clearAllMocks());

it('does not preselect a personality on first opening', () => {
  const screen = render(<MbtiSelector {...props} />);
  expect(props.onMbtiChange).toHaveBeenLastCalledWith('----');
  expect(screen.getAllByRole('radio').every(button => !button.props.accessibilityState.checked)).toBe(true);
});

it.each([
  { indices: [0, 2, 4, 6], type: 'INFP', scores: [75, 75, 75, 75] },
  { indices: [1, 3, 5, 7], type: 'ESTJ', scores: [25, 25, 25, 25] },
])('maps tap choices to the existing API score direction ($type)', ({ indices, type, scores }) => {
  const screen = render(<MbtiSelector {...props} />);
  indices.forEach(index => fireEvent.press(screen.getAllByRole('radio')[index]));
  expect(props.onMbtiChange).toHaveBeenLastCalledWith(type);
  expect(props.onScoresChange).toHaveBeenLastCalledWith({ ieScore: scores[0], nsScore: scores[1], ftScore: scores[2], pjScore: scores[3] });
  expect(screen.getByText('4 / 4 선택')).toBeTruthy();
});

it('lets a screen reader refine the same selected axis and retains scroll recovery', () => {
  const onDragEnd = jest.fn();
  const screen = render(<MbtiSelector {...props} onDragEnd={onDragEnd} />);
  fireEvent.press(screen.getAllByRole('radio')[0]);
  fireEvent.press(screen.getByRole('button', { name: '성향 세부 조정' }));
  const axis = screen.getAllByRole('adjustable')[0];
  fireEvent(axis, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
  expect(props.onScoresChange).toHaveBeenLastCalledWith(expect.objectContaining({ ieScore: 80 }));
  fireEvent.press(screen.getByRole('button', { name: '성향 세부 조정' }));
  expect(screen.queryByRole('adjustable')).toBeNull();
  expect(onDragEnd).toHaveBeenCalled();
});
