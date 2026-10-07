/** One presentation contract for registration previews and public profile surfaces. */
export const PROFILE_PHOTO_ASPECT = 4 / 5;
export const RECOMMENDATION_PHOTO_ASPECT = 4 / 3;
export const PHOTO_PREVIEW_ASPECTS = {
  detail: PROFILE_PHOTO_ASPECT,
  card: RECOMMENDATION_PHOTO_ASPECT,
  avatar: 1,
} as const;
export const PROFILE_PHOTO_MAX_WIDTH = 440;
export type ProfilePhotoPresentationMode = keyof typeof PHOTO_PREVIEW_ASPECTS;
