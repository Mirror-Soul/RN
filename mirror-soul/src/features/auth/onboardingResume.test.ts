import { getAuthEntryEmail, getAuthRedirect, getOnboardingStage, ONBOARDING_RESUME_ROUTE } from './onboardingResume';

it.each([
  ['ONBOARD_A', '/signup/profile', 2],
  ['ONBOARD_B', '/signup/express', 3],
  ['ONBOARD_C', '/signup/interview', 4],
  ['ONBOARD_D', '/signup/face-scan', 5],
])('resumes %s at the first unfinished stage without redirecting an already open form', (userStatus, route, step) => {
  expect(getOnboardingStage(userStatus)).toMatchObject({ route, step });
  expect(getAuthRedirect({ isLoggedIn: true, userStatus, pathname: '/login', needsOnboardingResume: true })).toBe(ONBOARDING_RESUME_ROUTE);
  expect(getAuthRedirect({ isLoggedIn: true, userStatus, pathname: ONBOARDING_RESUME_ROUTE, needsOnboardingResume: true })).toBeNull();
  expect(getAuthRedirect({ isLoggedIn: true, userStatus, pathname: ONBOARDING_RESUME_ROUTE })).toBe(route);
  expect(getAuthRedirect({ isLoggedIn: true, userStatus, pathname: route })).toBeNull();
});

it('sends completed users home while preserving chat and call deep links', () => {
  for (const pathname of ['/login', '/signup', ONBOARDING_RESUME_ROUTE]) {
    expect(getAuthRedirect({ isLoggedIn: true, userStatus: 'ACTIVE', pathname, needsOnboardingResume: true })).toBe('/(main)');
  }
  for (const pathname of ['/chat/3', '/ai-call', '/call-detail']) {
    expect(getAuthRedirect({ isLoggedIn: true, userStatus: 'ACTIVE', pathname })).toBeNull();
  }
});

it('allows public account creation but protects all later signup stages and the resume screen', () => {
  for (const pathname of ['/login', '/forgot-password', '/signup']) {
    expect(getAuthRedirect({ isLoggedIn: false, userStatus: null, pathname })).toBeNull();
  }
  for (const pathname of ['/signup/profile', '/signup/interview', ONBOARDING_RESUME_ROUTE, '/chat/1']) {
    expect(getAuthRedirect({ isLoggedIn: false, userStatus: 'ONBOARD_A', pathname, needsOnboardingResume: true })).toBe('/login');
  }
});

it('does not infer progress from unknown statuses or malformed email params', () => {
  for (const status of [null, 'ACTIVE', 'ONBOARD_E', 'constructor', 'DELETED']) expect(getOnboardingStage(status)).toBeNull();
  expect(getAuthEntryEmail(['first@example.com', 'other@example.com'])).toBe('');
  expect(getAuthEntryEmail('x'.repeat(255))).toBe('');
  expect(getAuthEntryEmail('  me@example.com  ')).toBe('me@example.com');
});
