import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { NotificationToggle } from './NotificationToggle';

jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
it('exposes the confirmed setting to screen readers and responds to a full-control tap', () => {
  const change = jest.fn();
  const screen = render(<NotificationToggle value={true} label="메시지 알림" onToggle={change} />);
  expect(screen.getByRole('switch', { checked: true })).toBeEnabled();
  expect(screen.getByText('켜짐')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('메시지 알림'));
  expect(change).toHaveBeenCalledTimes(1);
});
it('does not represent missing data as a confirmed off setting or allow edits during save', () => {
  const change = jest.fn();
  const screen = render(<NotificationToggle value={null} label="메시지 알림" onToggle={change} />);
  expect(screen.getByText('확인 필요')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('메시지 알림'));
  screen.rerender(<NotificationToggle value={true} isSaving label="메시지 알림" onToggle={change} />);
  expect(screen.getByText('저장 중')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('메시지 알림'));
  expect(change).not.toHaveBeenCalled();
});
