/** Runtime-loaded Korean/Latin faces; no native project regeneration is required. */
export const BrowseFontFamily = {
  regular: 'MirrorSoulSuiteRegular',
  medium: 'MirrorSoulSuiteMedium',
  semibold: 'MirrorSoulSuiteSemiBold',
  heading: 'MirrorSoulNanumRoundRegular',
  headingBold: 'MirrorSoulNanumRoundBold',
} as const;

export const BROWSE_FONT_ASSETS = {
  [BrowseFontFamily.regular]: require('@/assets/fonts/SUITE-Regular.ttf'),
  [BrowseFontFamily.medium]: require('@/assets/fonts/SUITE-Medium.ttf'),
  [BrowseFontFamily.semibold]: require('@/assets/fonts/SUITE-SemiBold.ttf'),
  [BrowseFontFamily.heading]: require('@/assets/fonts/NanumSquareRound-Regular.ttf'),
  [BrowseFontFamily.headingBold]: require('@/assets/fonts/NanumSquareRound-Bold.ttf'),
};
