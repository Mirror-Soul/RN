import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blockUser } from '@/src/services/blockService';
import type { ChatRoomListResult } from '@/src/types/api/chat';

/**
 * POST /blocks/{uuid} — 차단하면 백엔드 쿼리가 두 사람의 채팅방을 방 목록/메시지 조회에서
 * 자동으로 제외한다(ChatRoomMemberRepository의 각 쿼리가 UserBlock 존재 시 not exists로
 * 걸러냄, 직접 확인함). 그래서 로컬 blockList.ts 같은 클라이언트 측 숨김 목록이 더 이상
 * 필요 없다 — 성공 시 캐시에서 그 상대의 방만 지워두면 다음 조회 없이도 목록이 맞아떨어진다.
 */
export const useBlockUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserUuid: string) => blockUser(targetUserUuid),
    onSuccess: (_response, targetUserUuid) => {
      queryClient.setQueryData<ChatRoomListResult>(['chat', 'rooms'], (old) => {
        if (!old) return old;
        const rooms = old.rooms.filter((room) => room.partner.userUuid !== targetUserUuid);
        return { totalCount: rooms.length, rooms };
      });
    },
  });
};
