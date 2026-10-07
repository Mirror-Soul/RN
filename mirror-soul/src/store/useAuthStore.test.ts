import { useAuthStore } from './useAuthStore';
import { tokenStorage } from '@/src/utils/tokenStorage';
import { isTokenExpired } from '@/src/utils/jwtUtils';
import { queryClient } from '@/src/services/queryClient';

jest.mock('@/src/utils/tokenStorage', () => ({ tokenStorage: {
  getAccessToken: jest.fn(), getRefreshToken: jest.fn(), getUserUuid: jest.fn(), getUserStatus: jest.fn(),
  saveTokens: jest.fn(), saveUserStatus: jest.fn(), saveRefreshedTokens: jest.fn(), clearAll: jest.fn(),
} }));
jest.mock('@/src/utils/jwtUtils', () => ({ isTokenExpired: jest.fn() }));
jest.mock('@/src/services/queryClient', () => ({ queryClient: { clear: jest.fn() } }));
jest.mock('@/src/utils/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
const tokens = { accessToken: 'access', refreshToken: 'refresh', userUuid: 'me' };
beforeEach(() => {
  jest.resetAllMocks();
  useAuthStore.setState({ isHydrated: false, isLoggedIn: false, accessToken: null, userUuid: null, userStatus: null, hasInterruptedSignup: false, needsOnboardingResume: false });
  (tokenStorage.getAccessToken as jest.Mock).mockResolvedValue('access');
  (tokenStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh');
  (tokenStorage.getUserUuid as jest.Mock).mockResolvedValue('me');
  (isTokenExpired as jest.Mock).mockReturnValue(false);
});

it.each(['ONBOARD_A', 'ONBOARD_B', 'ONBOARD_C', 'ONBOARD_D'])('offers a resume explanation only after a successful login for %s', async userStatus => {
  await useAuthStore.getState().login({ ...tokens, userStatus }, { showOnboardingResume: true });
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: true, userStatus, needsOnboardingResume: true });
  useAuthStore.getState().continueOnboarding();
  expect(useAuthStore.getState()).toMatchObject({ userStatus, needsOnboardingResume: false });
});

it('does not interrupt a newly created account or a completed member with the resume screen', async () => {
  await useAuthStore.getState().login({ ...tokens, userStatus: 'ONBOARD_A' });
  expect(useAuthStore.getState().needsOnboardingResume).toBe(false);
  await useAuthStore.getState().login({ ...tokens, userStatus: 'ACTIVE' }, { showOnboardingResume: true });
  expect(useAuthStore.getState().needsOnboardingResume).toBe(false);
});

it('requires fresh login after restoring an incomplete local session and retains only an anonymous UI hint', async () => {
  (tokenStorage.getUserStatus as jest.Mock).mockResolvedValue('ONBOARD_B');
  await useAuthStore.getState().hydrate();
  expect(tokenStorage.clearAll).toHaveBeenCalledTimes(1);
  expect(queryClient.clear).toHaveBeenCalledTimes(1);
  expect(useAuthStore.getState()).toMatchObject({ isHydrated: true, isLoggedIn: false, accessToken: null, userUuid: null, userStatus: null, hasInterruptedSignup: true, needsOnboardingResume: false });
});

it('preserves valid active-member restoration and rejects expired refresh tokens', async () => {
  (tokenStorage.getUserStatus as jest.Mock).mockResolvedValue('ACTIVE');
  await useAuthStore.getState().hydrate();
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: true, userStatus: 'ACTIVE', needsOnboardingResume: false });
  expect(tokenStorage.clearAll).not.toHaveBeenCalled();
  (isTokenExpired as jest.Mock).mockReturnValue(true);
  await useAuthStore.getState().hydrate();
  expect(useAuthStore.getState().isLoggedIn).toBe(false);
});

it('does not announce login success if credentials could not be stored', async () => {
  (tokenStorage.saveTokens as jest.Mock).mockRejectedValue(new Error('Storage unavailable'));
  await expect(useAuthStore.getState().login({ ...tokens, userStatus: 'ONBOARD_A' }, { showOnboardingResume: true })).rejects.toThrow();
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: false, needsOnboardingResume: false });
});

it('pauses without retaining tokens or the next-stage gate and clears it on status updates', async () => {
  await useAuthStore.getState().login({ ...tokens, userStatus: 'ONBOARD_C' }, { showOnboardingResume: true });
  await useAuthStore.getState().logout();
  expect(useAuthStore.getState()).toMatchObject({ isLoggedIn: false, userUuid: null, accessToken: null, needsOnboardingResume: false, hasInterruptedSignup: true });
  await useAuthStore.getState().login({ ...tokens, userStatus: 'ONBOARD_D' }, { showOnboardingResume: true });
  await useAuthStore.getState().updateUserStatus('ACTIVE');
  expect(useAuthStore.getState()).toMatchObject({ userStatus: 'ACTIVE', needsOnboardingResume: false, hasInterruptedSignup: false });
});
