/** Text agreement only: this does not verify speaker identity or recording quality. */
export const MIN_READING_SIMILARITY = 0.75;

export function normalizeReadingText(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[^\p{L}\p{N}]/gu, '');
}

/** Normalized edit similarity penalizes omitted words and unrelated extra speech. */
export function readingSimilarity(expected: string, recognized: string): number {
  const target = Array.from(normalizeReadingText(expected));
  const spoken = Array.from(normalizeReadingText(recognized));
  if (!target.length || !spoken.length) return 0;
  // These are short reading prompts. Fail closed for unexpectedly large recognizer results.
  if (target.length > 2048 || spoken.length > 2048) return 0;
  let previous = Array.from({ length: spoken.length + 1 }, (_, index) => index);
  for (let i = 1; i <= target.length; i++) {
    const current = [i];
    for (let j = 1; j <= spoken.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (target[i - 1] === spoken[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return 1 - previous[spoken.length] / Math.max(target.length, spoken.length);
}

export function formatVoiceCooldown(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0;
  return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`;
}
