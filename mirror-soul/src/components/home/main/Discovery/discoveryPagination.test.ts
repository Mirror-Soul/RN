import { shouldPrefetchNextPage } from './discoveryPagination';

describe('shouldPrefetchNextPage', () => {
  it('does not prefetch when loaded cards are still far from the threshold', () => {
    expect(
      shouldPrefetchNextPage({ currentIndex: 0, loadedCount: 10, hasNextPage: true, isFetchingNextPage: false })
    ).toBe(false);
  });

  it('prefetches once the current index reaches the threshold from the end', () => {
    expect(
      shouldPrefetchNextPage({ currentIndex: 7, loadedCount: 10, hasNextPage: true, isFetchingNextPage: false })
    ).toBe(true);
  });

  it('does not prefetch again while a fetch is already in flight', () => {
    expect(
      shouldPrefetchNextPage({ currentIndex: 9, loadedCount: 10, hasNextPage: true, isFetchingNextPage: true })
    ).toBe(false);
  });

  it('does not prefetch when there is no next page', () => {
    expect(
      shouldPrefetchNextPage({ currentIndex: 9, loadedCount: 10, hasNextPage: false, isFetchingNextPage: false })
    ).toBe(false);
  });
});
