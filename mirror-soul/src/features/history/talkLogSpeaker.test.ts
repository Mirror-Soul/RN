import { SELF_TWIN_LABEL, canEditTalkLog, isSelfCall, speakerLabel } from './talkLogSpeaker';

describe('isSelfCall', () => {
  const me = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  it('matches the same user regardless of letter case', () => {
    expect(isSelfCall(me, me)).toBe(true);
    expect(isSelfCall(me.toUpperCase(), me)).toBe(true);
  });
  it('never matches another user or a missing identifier', () => {
    expect(isSelfCall('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', me)).toBe(false);
    expect(isSelfCall(me, null)).toBe(false);
    expect(isSelfCall(undefined, me)).toBe(false);
    expect(isSelfCall('', '')).toBe(false);
  });
});

describe('speakerLabel', () => {
  it.each([
    ['ME', '나'], ['MY_TWIN', SELF_TWIN_LABEL], ['PARTNER', '지수'], ['PARTNER_TWIN', '지수의 AI 트윈'],
  ] as const)('names %s after the other person in a normal call', (speaker, label) => {
    expect(speakerLabel(speaker, '지수')).toBe(label);
  });
  it('falls back to a generic name when the partner has none', () => {
    expect(speakerLabel('PARTNER', '')).toBe('상대방');
    expect(speakerLabel('PARTNER_TWIN', '')).toBe('상대방의 AI 트윈');
  });
  it.each([
    ['ME', '나'], ['MY_TWIN', SELF_TWIN_LABEL], ['PARTNER', '나'], ['PARTNER_TWIN', SELF_TWIN_LABEL],
  ] as const)('never shows the user’s own name as a partner in a call with their own clone: %s', (speaker, label) => {
    expect(speakerLabel(speaker, '홍길동', true)).toBe(label);
  });
});

describe('canEditTalkLog', () => {
  it('only edits what the server marks editable', () => {
    expect(canEditTalkLog({ speaker: 'MY_TWIN', editable: false })).toBe(false);
    expect(canEditTalkLog({ speaker: 'MY_TWIN', editable: true })).toBe(true);
  });
  it('does not edit the other side’s twin or people in a normal call even if the server flag is set', () => {
    for (const speaker of ['ME', 'PARTNER', 'PARTNER_TWIN'] as const) {
      expect(canEditTalkLog({ speaker, editable: true })).toBe(false);
    }
  });
  it('edits the user’s own twin in a call with their own clone, where it arrives as PARTNER_TWIN', () => {
    expect(canEditTalkLog({ speaker: 'PARTNER_TWIN', editable: true }, true)).toBe(true);
    expect(canEditTalkLog({ speaker: 'PARTNER_TWIN', editable: false }, true)).toBe(false);
    expect(canEditTalkLog({ speaker: 'ME', editable: true }, true)).toBe(false);
  });
});
