import { ApiResponse } from './common';

/**
 * 통화 기록(History) 도메인 API 타입 정의
 */

export type HistoryType = 'ALL' | 'RECEIVED' | 'SENT';
export type MatchTarget = 'MY_TWIN' | 'PARTNER_TWIN';
export type TalkLogSpeaker = 'PARTNER' | 'MY_TWIN' | 'ME' | 'PARTNER_TWIN';
export type WeeklyTrend = 'UP' | 'DOWN' | 'SAME' | 'NO_DATA';

export interface PartnerResult {
  userUuid: string;
  name: string;
  age: number | null;
  profileImageUrl: string | null;
  twinSyncRate: number | null;
}

// ─────────────────────────────────────────────
// GET /history/weekly-summary
// ─────────────────────────────────────────────
export interface WeeklyPeriodResult {
  startedAt: string;
  endedAt: string;
  nextResetAt: string;
}

export interface WeeklySummaryResult {
  period: WeeklyPeriodResult;
  totalTalkTimeSec: number;
  receivedCallCount: number;
  sentCallCount: number;
  changeRate: number | null;
  trend: WeeklyTrend;
  comparable: boolean;
}

export type WeeklySummaryResponse = ApiResponse<WeeklySummaryResult>;

// ─────────────────────────────────────────────
// GET /history/calls
// ─────────────────────────────────────────────
export interface CallHistoryResult {
  callId: number;
  type: HistoryType;
  partner: PartnerResult;
  description: string;
  mediaType: 'VOICE' | 'VIDEO';
  durationSec: number | null;
  matchTarget: MatchTarget;
  matchScore: number | null;
  topics: string[];
  startedAt: string;
  isNew: boolean;
}

export interface CallHistoryGroupResult {
  date: string;
  histories: CallHistoryResult[];
}

export interface CallHistorySummaryResult {
  totalCount: number;
  receivedCount: number;
  sentCount: number;
}

export interface CallHistoryListResult {
  summary: CallHistorySummaryResult;
  groups: CallHistoryGroupResult[];
}

export type CallHistoryListResponse = ApiResponse<CallHistoryListResult>;

// ─────────────────────────────────────────────
// GET /history/calls/{call-id}/talk-logs
// ─────────────────────────────────────────────
export interface TalkLogResult {
  talkLogId: number;
  speaker: TalkLogSpeaker;
  message: string;
  startedAt: string;
  endedAt: string;
  editable: boolean;
  edited: boolean;
  editedAt: string | null;
}

export interface TalkLogListResult {
  callId: number;
  callNumber: number;
  partner: PartnerResult;
  description: string;
  startedAt: string;
  talkLogs: TalkLogResult[];
}

export type TalkLogListResponse = ApiResponse<TalkLogListResult>;

// ─────────────────────────────────────────────
// PATCH /history/calls/{call-id}/talk-logs/{talk-log-id}
// ─────────────────────────────────────────────
export interface UpdateTalkLogRequest {
  message: string;
}

export type TalkLogResponse = ApiResponse<TalkLogResult>;
