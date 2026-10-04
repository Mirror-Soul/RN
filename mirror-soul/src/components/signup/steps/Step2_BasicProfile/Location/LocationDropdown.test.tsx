import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import LocationDropdown from './LocationDropdown';
import { getSidoList, getSigunguList, getEupmyeondongList } from '@/src/services/onboardingService';

jest.mock('@/src/services/onboardingService', () => ({ getSidoList: jest.fn(), getSigunguList: jest.fn(), getEupmyeondongList: jest.fn() }));
jest.mock('@/src/components/signup/common/SelectDropdownModal', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));

function props() {
  return { onSelect: jest.fn(), onClose: jest.fn(), sigunguCache: { current: new Map<string, string[]>() }, eupmyeondongCache: { current: new Map<string, string[]>() }, anchor: { x: 24, y: 100, width: 300, height: 52 } };
}
beforeEach(() => {
  jest.resetAllMocks();
  (getSidoList as jest.Mock).mockResolvedValue({ isSuccess: true, result: ['서울', '부산'] });
  (getSigunguList as jest.Mock).mockResolvedValue({ isSuccess: true, result: ['강남구'] });
  (getEupmyeondongList as jest.Mock).mockResolvedValue({ isSuccess: true, result: ['역삼동'] });
});

it('keeps a late response for a different region out of the current list', async () => {
  let finishOld!: (value: unknown) => void;
  (getSigunguList as jest.Mock).mockImplementation(({ sidoName }) => sidoName === '서울'
    ? new Promise(resolve => { finishOld = resolve; }) : Promise.resolve({ isSuccess: true, result: ['해운대구'] }));
  const screen = render(<LocationDropdown {...props()} />);
  await waitFor(() => expect(screen.getByRole('button', { name: '서울' })).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: '서울' }));
  fireEvent.press(screen.getByRole('tab', { name: '시/도' }));
  fireEvent.press(screen.getByRole('button', { name: '부산' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '해운대구' })).toBeTruthy());
  await act(async () => { finishOld({ isSuccess: true, result: ['강남구'] }); });
  expect(screen.queryByRole('button', { name: '강남구' })).toBeNull();
  expect(screen.getByRole('button', { name: '해운대구' })).toBeTruthy();
});

it('lets users retry a failed list request in the same dropdown', async () => {
  (getSidoList as jest.Mock).mockRejectedValueOnce(new Error('Offline'));
  const screen = render(<LocationDropdown {...props()} />);
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: '지역 목록 다시 불러오기' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '서울' })).toBeTruthy());
  expect(getSidoList).toHaveBeenCalledTimes(2);
});

it('returns the selected three levels and keeps cached lists for reopening', async () => {
  const callbacks = props();
  const screen = render(<LocationDropdown {...callbacks} />);
  await waitFor(() => expect(screen.getByRole('button', { name: '서울' })).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: '서울' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '강남구' })).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: '강남구' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '역삼동' })).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: '역삼동' }));
  expect(callbacks.onSelect).toHaveBeenCalledWith({ sidoName: '서울', sigunguName: '강남구', eupmyeondongName: '역삼동' });
  expect(callbacks.sigunguCache.current.get('서울')).toEqual(['강남구']);
  expect(callbacks.eupmyeondongCache.current.get('서울_강남구')).toEqual(['역삼동']);
  expect(callbacks.onClose).toHaveBeenCalledTimes(1);
});
