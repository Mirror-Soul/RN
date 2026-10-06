import { MIN_READING_SIMILARITY, readingSimilarity } from './readingSimilarity';

it('ignores spacing, punctuation, case and equivalent Unicode forms', () => {
  expect(readingSimilarity('오늘은, 편안한 하루예요!', '오늘 은 편안한 하루 예요')).toBe(1);
  expect(readingSimilarity('Mirror Ｓｏｕｌ', 'mirror soul')).toBe(1);
});

it('allows the exact 75% boundary but rejects more omissions and unrelated additions', () => {
  expect(readingSimilarity('가나다라마바사아', '가나다라마바차카')).toBe(MIN_READING_SIMILARITY);
  expect(readingSimilarity('가나다라마바사아', '가나다라마차카타')).toBeLessThan(MIN_READING_SIMILARITY);
  expect(readingSimilarity('가나다라마바사아', '가나다')).toBeLessThan(MIN_READING_SIMILARITY);
  expect(readingSimilarity('가나다라마바사아', '가나다라마바사아옆사람의다른대화가섞여있어요')).toBeLessThan(MIN_READING_SIMILARITY);
});

it('never passes silence, empty prompts or recognizer junk', () => {
  expect(readingSimilarity('읽을 문장', ' ... ')).toBe(0);
  expect(readingSimilarity('', '')).toBe(0);
  expect(readingSimilarity('읽을 문장', 'x'.repeat(2049))).toBe(0);
});
