import { ApiResponse } from './common';

/**
 * 사용자 차단(Block) 도메인 API 타입 정의
 * 백엔드 UserBlockController(`/blocks`) 기준
 */

// ─────────────────────────────────────────────
// POST /blocks/{target-user-uuid}
// DELETE /blocks/{target-user-uuid}
// ─────────────────────────────────────────────
export type BlockResponse = ApiResponse<null>;
