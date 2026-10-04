export const notificationQueryKeys = {
  chatRooms: (userUuid: string | null) => ['notification', 'chatRooms', userUuid] as const,
  chatRoom: (userUuid: string | null, roomId: number) => ['chat', 'notification', userUuid, roomId] as const,
};
