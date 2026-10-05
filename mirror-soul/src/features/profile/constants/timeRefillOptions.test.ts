import { TIME_REFILL_OPTIONS, formatRefillPrice, getTimeRefillSavings } from './timeRefillOptions';

it('compares two hours with four 30-minute purchases, not an invented historical price', () => {
  expect(getTimeRefillSavings(TIME_REFILL_OPTIONS[1])).toEqual({ referencePriceWon: 19600, savingsWon: 4700, savingsPercent: 24 });
  expect(TIME_REFILL_OPTIONS[1].seconds).toBe(7200);
});
it('compares ten hours with twenty 30-minute purchases', () => {
  expect(getTimeRefillSavings(TIME_REFILL_OPTIONS[2])).toEqual({ referencePriceWon: 98000, savingsWon: 39000, savingsPercent: 40 });
  expect(TIME_REFILL_OPTIONS[2].seconds).toBe(36000);
});
it('does not invent savings for the base option or a higher price', () => {
  expect(getTimeRefillSavings(TIME_REFILL_OPTIONS[0]).savingsWon).toBe(0);
  expect(getTimeRefillSavings({ ...TIME_REFILL_OPTIONS[1], priceWon: 20000 }).savingsWon).toBe(0);
  expect(formatRefillPrice(14900)).toBe('₩14,900');
});
