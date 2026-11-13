import { TEMPORARY_SIGNUP_IDENTITY } from './temporarySignupIdentity';

const { gender, birthDate } = TEMPORARY_SIGNUP_IDENTITY;
// 백엔드 RecommendService.ADULT_AGE — 이 나이 이상이어야 성인 추천 후보군에 묶인다.
const ADULT_AGE = 19;

it('is not null, because the backend refuses recommendations to accounts without both values', () => {
  expect(gender).not.toBeNull();
  expect(birthDate).not.toBeNull();
});

it('uses a gender the backend Gender enum accepts', () => {
  expect(['MALE', 'FEMALE']).toContain(gender);
});

it('uses a real calendar date in the ISO LocalDate format the backend parses', () => {
  expect(birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(new Date(`${birthDate}T00:00:00Z`).toISOString().slice(0, 10)).toBe(birthDate);
});

it('keeps the account in the adult cohort', () => {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - ADULT_AGE);
  expect(new Date(`${birthDate}T00:00:00`).getTime()).toBeLessThanOrEqual(cutoff.getTime());
});
