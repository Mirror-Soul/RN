export const SIGNUP_ROUTES = {
  ACCOUNT: '/signup',
  PROFILE: '/signup/profile',
  EXPRESS: '/signup/express',
  INTERVIEW: '/signup/interview',
  FACESCAN: '/signup/face-scan',
} as const;

export const SIGNUP_STEP_MAP: Record<string, number> = {
  [SIGNUP_ROUTES.ACCOUNT]: 1,
  [SIGNUP_ROUTES.PROFILE]: 2,
  [SIGNUP_ROUTES.EXPRESS]: 3,
  [SIGNUP_ROUTES.INTERVIEW]: 4,
  [SIGNUP_ROUTES.FACESCAN]: 5,
};
