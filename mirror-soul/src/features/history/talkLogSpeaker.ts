import type { TalkLogResult } from '@/src/types/api/history';

export const SELF_TWIN_LABEL = '내 AI 트윈';
export const SELF_CALL_DESCRIPTION = '나와 내 AI 트윈의 대화';

/** 통화 상대가 나 자신인 기록(트윈 시뮬레이션처럼 내 클론과 한 통화)인지. */
export const isSelfCall = (partnerUserUuid?: string | null, myUserUuid?: string | null): boolean =>
  !!partnerUserUuid && !!myUserUuid && partnerUserUuid.toLowerCase() === myUserUuid.toLowerCase();

/** 내 클론과의 통화에서도 백엔드는 발신자 기준으로 ME/PARTNER_TWIN을 내려주므로 상대 이름 대신 '내 AI 트윈'으로 표시한다. */
export function speakerLabel(speaker: TalkLogResult['speaker'], partnerName: string, selfCall = false): string {
  switch (speaker) {
    case 'ME': return '나';
    case 'MY_TWIN': return SELF_TWIN_LABEL;
    case 'PARTNER': return selfCall ? '나' : partnerName || '상대방';
    case 'PARTNER_TWIN': return selfCall ? SELF_TWIN_LABEL : `${partnerName || '상대방'}의 AI 트윈`;
  }
}

/** 서버가 editable로 허용한 내 트윈 답변만 수정한다. 내 클론과의 통화에서는 내 트윈이 PARTNER_TWIN으로 온다. */
export const canEditTalkLog = (log: Pick<TalkLogResult, 'speaker' | 'editable'>, selfCall = false): boolean =>
  log.editable && (log.speaker === 'MY_TWIN' || (selfCall && log.speaker === 'PARTNER_TWIN'));
