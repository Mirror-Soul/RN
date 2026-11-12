import { TRANSCRIPT_SETTLE_WINDOW_MS, markCallEnded, transcriptSettleRemainingMs } from './callTranscriptSettle';

it('does not treat a call this session never ended as settling', () => {
  expect(transcriptSettleRemainingMs(9001, 1_000)).toBe(0);
});

it('counts the settle window down after a call ends and stops at its end', () => {
  markCallEnded(9002, 1_000);
  expect(transcriptSettleRemainingMs(9002, 1_000)).toBe(TRANSCRIPT_SETTLE_WINDOW_MS);
  expect(transcriptSettleRemainingMs(9002, 6_000)).toBe(TRANSCRIPT_SETTLE_WINDOW_MS - 5_000);
  expect(transcriptSettleRemainingMs(9002, 1_000 + TRANSCRIPT_SETTLE_WINDOW_MS)).toBe(0);
  expect(transcriptSettleRemainingMs(9002, 1_000 + TRANSCRIPT_SETTLE_WINDOW_MS + 1)).toBe(0);
});

it('tracks calls independently and forgets expired ones when another call ends', () => {
  markCallEnded(9003, 0);
  markCallEnded(9004, TRANSCRIPT_SETTLE_WINDOW_MS + 10);
  expect(transcriptSettleRemainingMs(9003, TRANSCRIPT_SETTLE_WINDOW_MS + 10)).toBe(0);
  expect(transcriptSettleRemainingMs(9004, TRANSCRIPT_SETTLE_WINDOW_MS + 10)).toBe(TRANSCRIPT_SETTLE_WINDOW_MS);
});

it('never lengthens the settle window when the device clock moves backwards', () => {
  markCallEnded(9005, 10_000_000);
  expect(transcriptSettleRemainingMs(9005, 10_000_000 - 3_600_000)).toBe(TRANSCRIPT_SETTLE_WINDOW_MS);
});
