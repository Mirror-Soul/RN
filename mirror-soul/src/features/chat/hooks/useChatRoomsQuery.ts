import { useQuery } from '@tanstack/react-query';
import { getChatRooms } from '@/src/services/chatService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /chat/rooms — 내 채팅방 목록 조회 */
export const useChatRoomsQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => (await getChatRooms()).result,
    enabled: isLoggedIn,
  });
};
