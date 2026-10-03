import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { savePersonality } from '@/src/services/onboardingService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useStep3Form } from './useStep3Form';

jest.mock('@/src/services/onboardingService', () => ({ savePersonality: jest.fn() }));
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: jest.fn() } }));
const updateStatus = jest.fn();
const onSuccess = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  updateStatus.mockResolvedValue(undefined);
  (useAuthStore.getState as jest.Mock).mockReturnValue({ updateUserStatus: updateStatus });
  (savePersonality as jest.Mock).mockResolvedValue({ isSuccess: true });
});
afterEach(() => jest.restoreAllMocks());

it('requires all four actual choices and a nonblank introduction', async () => {
  const { result } = renderHook(() => useStep3Form());
  act(() => result.current.setDescription('내 소개'));
  await act(async () => { await result.current.handleSubmit(onSuccess); });
  expect(savePersonality).not.toHaveBeenCalled();
  act(() => { result.current.setMbti('IN-P'); result.current.setDescription('  '); });
  expect(result.current.isFormValid).toBe(false);
});

it('blocks repeated saves before the submitting state rerenders', async () => {
  let finish!: (value: { isSuccess: boolean }) => void;
  (savePersonality as jest.Mock).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useStep3Form());
  act(() => { result.current.setMbti('INFP'); result.current.setScores({ ieScore: 75, nsScore: 75, ftScore: 75, pjScore: 75 }); result.current.setDescription(' 내 소개 '); });
  let first!: Promise<void>;
  await act(async () => { first = result.current.handleSubmit(onSuccess); await result.current.handleSubmit(onSuccess); });
  expect(savePersonality).toHaveBeenCalledTimes(1);
  await act(async () => { finish({ isSuccess: true }); await first; });
  expect(savePersonality).toHaveBeenCalledWith({ mbti: 'INFP', ieScore: 75, nsScore: 75, ftScore: 75, pjScore: 75, selfIntroduction: '내 소개' });
  expect(updateStatus).toHaveBeenCalledWith('ONBOARD_C');
  expect(onSuccess).toHaveBeenCalledTimes(1);
});

it('preserves the chosen personality and introduction after a failed save', async () => {
  (savePersonality as jest.Mock).mockRejectedValueOnce(new Error('연결 실패'));
  const { result } = renderHook(() => useStep3Form());
  act(() => { result.current.setMbti('INFP'); result.current.setDescription('작성한 소개'); });
  await act(async () => { await result.current.handleSubmit(onSuccess); });
  expect(result.current.mbti).toBe('INFP');
  expect(result.current.description).toBe('작성한 소개');
  expect(result.current.isSubmitting).toBe(false);
  expect(onSuccess).not.toHaveBeenCalled();
});
