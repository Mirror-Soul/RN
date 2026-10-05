import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';

/** Server status denotes the last completed stage, not an unsaved form draft. */
const STAGES = {
  ONBOARD_A: { route: SIGNUP_ROUTES.PROFILE, step: 2, title: '기본 프로필', description: '상대에게 보여줄 이름과 기본 정보를 알려주세요.' },
  ONBOARD_B: { route: SIGNUP_ROUTES.EXPRESS, step: 3, title: '성격 유형', description: '나의 성향과 소개를 트윈에게 알려주세요.' },
  ONBOARD_C: { route: SIGNUP_ROUTES.INTERVIEW, step: 4, title: '음성 인터뷰', description: '짧은 경험과 생각을 목소리로 들려주세요.' },
  ONBOARD_D: { route: SIGNUP_ROUTES.FACESCAN, step: 5, title: '나의 아바타 만들기', description: '표정과 얼굴을 담아 나를 닮은 트윈을 만들어요.' },
} as const;

export const ONBOARDING_RESUME_ROUTE = '/signup/resume' as const;

export function getOnboardingStage(status: string | null) {
  return status && Object.prototype.hasOwnProperty.call(STAGES, status)
    ? STAGES[status as keyof typeof STAGES]
    : null;
}

/** Keep auth redirects in one place; never let a route param override server status. */
export function getAuthRedirect({
  isLoggedIn, userStatus, pathname, needsOnboardingResume = false,
}: {
  isLoggedIn: boolean;
  userStatus: string | null;
  pathname: string;
  needsOnboardingResume?: boolean;
}) {
  const isPublic = pathname === '/login' || pathname === '/forgot-password' || pathname === '/signup';
  if (!isLoggedIn) return isPublic ? null : '/login';
  if (userStatus === 'ACTIVE') {
    return isPublic || pathname.startsWith('/signup/') ? '/(main)' : null;
  }
  const stage = getOnboardingStage(userStatus);
  if (!stage) return null;
  const destination = needsOnboardingResume ? ONBOARDING_RESUME_ROUTE : stage.route;
  return pathname === destination ? null : destination;
}

export function getAuthEntryEmail(value: string | string[] | undefined) {
  return typeof value === 'string' && value.length <= 254 ? value.trim() : '';
}
