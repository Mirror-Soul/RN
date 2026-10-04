export const matchQueryKeys = {
  requests: (userUuid: string | null) =>
    ['match', 'meetingRequests', userUuid] as const,
  status: (userUuid: string | null) => ['match', 'status', userUuid] as const,
};
