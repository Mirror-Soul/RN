import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { MbtiBalance } from './MbtiBalance';
import type { MbtiAxisScores } from '@/src/types/api/home';

let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
beforeEach(() => { mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 }; });

jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }),
}));

it('keeps all four API score directions and shows complementary percentages in Korean', () => {
  const screen = render(<MbtiBalance scores={{ ieScore: 80, nsScore: 70, ftScore: 60, pjScore: 30 }} />);
  for (const label of [
    '에너지 방향, 내향 I 80%, 외향 E 20%',
    '정보 이해, 직관 N 70%, 감각 S 30%',
    '결정 방식, 감정 F 60%, 사고 T 40%',
    '생활 방식, 인식 P 30%, 판단 J 70%',
  ]) expect(screen.getByLabelText(label)).toBeTruthy();
});

it.each([[-10, 0, 100], [110, 100, 0], [50, 50, 50], [65.7, 66, 34]])(
  'normalizes a score of %s and keeps both displayed percentages totaling 100', (ieScore, left, right) => {
    const screen = render(<MbtiBalance scores={{ ieScore, nsScore: NaN, ftScore: NaN, pjScore: NaN }} />);
    expect(screen.getByLabelText(`에너지 방향, ${left === right ? '균형, ' : ''}내향 I ${left}%, 외향 E ${right}%`)).toBeTruthy();
    expect(screen.queryByText('정보 이해')).toBeNull();
  },
);

it('does not invent a balance when all scores are absent or invalid', () => {
  const screen = render(<MbtiBalance scores={{ ieScore: null, nsScore: undefined, ftScore: Infinity, pjScore: NaN } as unknown as MbtiAxisScores} />);
  expect(screen.toJSON()).toBeNull();
});

it('leads with the dominant trait and keeps the opposite percentage as secondary information', () => {
  const screen = render(<MbtiBalance scores={{ ieScore: 28, nsScore: 72, ftScore: 60, pjScore: 30 }} />);
  const energy = within(screen.getByLabelText('에너지 방향, 내향 I 28%, 외향 E 72%'));
  expect(energy.getByText('외향 E')).toBeTruthy();
  expect(energy.getByText('72%')).toBeTruthy();
  expect(energy.getByText('내향 I · 28%')).toBeTruthy();
  expect(screen.getByText('직관 N')).toBeTruthy();
  expect(screen.getByText('감정 F')).toBeTruthy();
  expect(screen.getByText('판단 J')).toBeTruthy();
  // Axis scores summarize each pair; they must not create or overwrite a four-letter MBTI type.
  expect(screen.queryByText('ENFJ')).toBeNull();
});

it('shows an equal balance without choosing a dominant trait', () => {
  const screen = render(<MbtiBalance scores={{ ieScore: 50, nsScore: NaN, ftScore: NaN, pjScore: NaN }} />);
  expect(screen.getByText('균형')).toBeTruthy();
  expect(screen.getByText('50% · 50%')).toBeTruthy();
  expect(screen.getByText('내향 I · 외향 E')).toBeTruthy();
  expect(screen.queryByText('내향 I')).toBeNull();
  expect(screen.queryByText('외향 E')).toBeNull();
});

it.each([
  { measuredWidth: 288, fontScale: 1, columns: 2 },
  { measuredWidth: 250, fontScale: 1, columns: 1 },
  { measuredWidth: 700, fontScale: 2, columns: 1 },
])('adapts to the actual available space and text size: %j', ({ measuredWidth, fontScale, columns }) => {
  mockDimensions = { ...mockDimensions, fontScale };
  const screen = render(<MbtiBalance scores={{ ieScore: 80, nsScore: 70, ftScore: 60, pjScore: 30 }} />);
  const grid = screen.UNSAFE_getAllByType(View).find(node => node.props.onLayout)!;
  fireEvent(grid, 'layout', { nativeEvent: { layout: { width: measuredWidth } } });
  const card = screen.getByLabelText('에너지 방향, 내향 I 80%, 외향 E 20%');
  const style = StyleSheet.flatten(card.props.style);
  expect(columns === 1 ? style.width : style.maxWidth).toBe(columns === 1 ? '100%' : '50%');
  expect(style.height).toBeUndefined();
  expect(screen.getByText('80%').props.numberOfLines).toBeUndefined();
  expect(screen.getByText('에너지 방향').props.allowFontScaling).not.toBe(false);
});
