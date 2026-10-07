import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FontFamily,
  FontSize,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import { useMainTabBottomPadding } from '@/src/hooks/useMainTabBottomPadding';
import { useMainTabScroll } from '@/src/hooks/useMainTabScroll';
import { ProfileImageReloadContext } from '@/src/features/profile/photo/useRetryableProfileImage';
import { mainTabTopPadding } from '@/src/components/home/common/MainTabHeader';
import {
  useMatchingDesign,
  MatchingText as Text,
} from '@/src/features/match/components/MatchingDesign';
import { useLayout } from '@/src/hooks/useLayout';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { useChatRoomsQuery } from '@/src/features/chat/hooks/useChatRoomsQuery';
import { getMyTime } from '@/src/services/profileService';
import type { MeetingRequestItem } from '@/src/types/api/meeting';
import type { ChatRoomSummary } from '@/src/types/api/chat';
import MatchingHeader from '@/src/components/home/match/parts/MatchingHeader';
import MatchingActiveStatus from '@/src/components/home/match/parts/MatchingActiveStatus';
import MatchingActionButtons, {
  MatchingTab,
} from '@/src/components/home/match/parts/MatchingActionButtons';
import MatchingChatItem from '@/src/components/home/match/parts/MatchingChatItem';
import MatchingTabStatus from '@/src/components/home/match/parts/MatchingTabStatus';
import { MeetingRequestCard } from './components/MeetingRequestCard';
import { MeetingRequestDetail } from './components/MeetingRequestDetail';
import { useReceivedMeetingRequestsQuery } from './hooks/useReceivedMeetingRequestsQuery';
import { useAcceptMeetingRequestMutation } from './hooks/useAcceptMeetingRequestMutation';
import { useRejectMeetingRequestMutation } from './hooks/useRejectMeetingRequestMutation';

type Row =
  | { kind: 'request'; request: MeetingRequestItem }
  | { kind: 'chat'; room: ChatRoomSummary };
type Action = { requestId: number; kind: 'accept' | 'reject' | 'call' };

export default function MatchScreen() {
  const { colors, palette } = useMatchingDesign();
  const { contentContainerStyle } = useLayout();
  const insets = useSafeAreaInsets();
  const bottomPadding = useMainTabBottomPadding();
  const scrollCallbacks = useMainTabScroll('match');
  const router = useRouter();
  const { receivedRequestId, receivedRequestReturnToken } =
    useLocalSearchParams<{
      receivedRequestId?: string;
      receivedRequestReturnToken?: string;
    }>();
  const { showToast } = useToast();
  const userUuid = useAuthStore((s) => s.userUuid);
  const [activeTab, setActiveTab] = useState<MatchingTab>('meet');
  const [pullRefreshTab, setPullRefreshTab] = useState<MatchingTab | null>(null);
  const pullRefreshLock = useRef(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const lock = useRef(false);
  const alive = useRef(true);
  const openedReturn = useRef<string | undefined>(undefined);
  const list = useRef<FlatList<Row>>(null);
  const requestsQuery = useReceivedMeetingRequestsQuery();
  const roomsQuery = useChatRoomsQuery();
  const accept = useAcceptMeetingRequestMutation();
  const reject = useRejectMeetingRequestMutation();
  const { refetch: refetchRequests } = requestsQuery;
  const { refetch: refetchRooms } = roomsQuery;
  const refresh = useCallback(
    () => Promise.allSettled([refetchRequests(), refetchRooms()]),
    [refetchRequests, refetchRooms],
  );
  const handlePullRefresh = async () => {
    if (pullRefreshLock.current) return;
    pullRefreshLock.current = true;
    setPullRefreshTab(activeTab);
    try {
      await refresh();
    } finally {
      pullRefreshLock.current = false;
      if (alive.current) setPullRefreshTab(null);
    }
  };
  useProfileRefresh(refresh);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    setSelectedId(null);
    setActionError(null);
    setUnreadOnly(false);
  }, [userUuid]);
  const requests = requestsQuery.data?.requests ?? [];
  const rooms = roomsQuery.data?.rooms ?? [];
  const unreadRooms = rooms.filter((room) => room.unreadCount > 0);
  const unreadCount = rooms.reduce(
    (sum, room) => sum + Math.max(0, room.unreadCount),
    0,
  );
  const selected = requests.find((request) => request.requestId === selectedId);
  useEffect(() => {
    const returnKey = `${receivedRequestId}:${receivedRequestReturnToken ?? ''}`;
    if (
      receivedRequestId &&
      returnKey !== openedReturn.current &&
      requestsQuery.data
    ) {
      openedReturn.current = returnKey;
      if (
        requestsQuery.data.requests.some(
          (request) => request.requestId === Number(receivedRequestId),
        )
      ) {
        setSelectedId(Number(receivedRequestId));
        setActiveTab('meet');
      }
    }
  }, [receivedRequestId, receivedRequestReturnToken, requestsQuery.data]);
  const query = activeTab === 'meet' ? requestsQuery : roomsQuery;
  const rows: Row[] =
    activeTab === 'meet'
      ? requests.map((request) => ({ kind: 'request', request }))
      : (unreadOnly ? unreadRooms : rooms).map((room) => ({
          kind: 'chat',
          room,
        }));
  const changeTab = (tab: MatchingTab) => {
    setActiveTab(tab);
    setPullRefreshTab(null);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  };
  const respond = async (request: MeetingRequestItem, kind: Action['kind']) => {
    if (
      lock.current ||
      !userUuid ||
      !useAuthStore.getState().isLoggedIn ||
      useAuthStore.getState().userUuid !== userUuid
    )
      return;
    lock.current = true;
    setAction({ requestId: request.requestId, kind });
    setActionError(null);
    const current = () =>
      alive.current &&
      useAuthStore.getState().isLoggedIn &&
      useAuthStore.getState().userUuid === userUuid;
    try {
      if (kind === 'call') {
        const time = (await getMyTime()).result.remainingTalkTime;
        if (!current()) return;
        if (!Number.isFinite(time) || time <= 0) {
          setActionError(
            '통화할 대화 시간이 없어요. 프로필에서 남은 시간을 확인하고 충전해 주세요.',
          );
          return;
        }
        setSelectedId(null);
        router.push({
          pathname: '/ai-call',
          params: {
            targetUuid: request.senderUserUuid,
            targetName: request.name,
            remainingSeconds: String(time),
            receivedRequestId: String(request.requestId),
          },
        });
      } else if (kind === 'accept') {
        const response = await accept.mutateAsync(request.requestId);
        if (!current()) return;
        setSelectedId(null);
        setActiveTab('chat');
        router.push(`/chat/${response.result.chatRoomId}`);
      } else {
        await reject.mutateAsync(request.requestId);
        if (current()) {
          setSelectedId(null);
          showToast('신청을 거절했어요.', 'info');
        }
      }
    } catch (error) {
      if (!current()) return;
      const message = getErrorDisplayMessage(
        error,
        kind === 'call'
          ? '통화를 준비하지 못했어요. 다시 시도해 주세요.'
          : '신청을 처리하지 못했어요. 다시 시도해 주세요.',
      );
      setActionError(message);
      const code = getErrorCode(error);
      if (
        code === 'MEETING_REQUEST_NOT_FOUND' ||
        code === 'MEETING_REQUEST_ALREADY_PROCESSED' ||
        code === 'MEETING_CHAT_ALREADY_EXISTS'
      ) {
        void refresh();
        showToast(message, 'error');
      } else if (selectedId == null) showToast(message, 'error');
    } finally {
      lock.current = false;
      if (alive.current) setAction(null);
    }
  };
  const empty = query.isLoading ? (
    <MatchingTabStatus isLoading message="목록을 불러오고 있어요" />
  ) : query.isError && !query.data ? (
    <MatchingTabStatus
      message="목록을 불러오지 못했어요"
      description="연결 상태를 확인한 뒤 다시 시도해 주세요."
      onRetry={() => {
        void refresh();
      }}
    />
  ) : activeTab === 'meet' ? (
    <MatchingTabStatus
      message="아직 받은 신청이 없어요"
      description="마음에 드는 상대의 트윈과 이야기하고, 먼저 관심을 전해보세요."
      onExplore={() => router.navigate('/(main)')}
    />
  ) : unreadOnly ? (
    <MatchingTabStatus
      kind="messages"
      message="읽지 않은 메시지가 없어요"
      description="새 메시지가 오면 여기에 모아드릴게요."
    />
  ) : (
    <MatchingTabStatus
      kind="messages"
      message="첫 대화를 기다리고 있어요"
      description="받은 신청을 수락하면 두 분만의 메시지방이 열려요."
      onRequests={() => changeTab('meet')}
      onExplore={() => router.navigate('/(main)')}
    />
  );
  return (
    <ProfileImageReloadContext.Provider value={activeTab === 'meet' ? requestsQuery.refetch : roomsQuery.refetch}><SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: colors.background.primary }]}
    >
      <FlatList<Row>
        {...scrollCallbacks}
        ref={list}
        data={rows}
        keyExtractor={(item) =>
          item.kind === 'request'
            ? `request-${item.request.requestId}`
            : `chat-${item.room.chatRoomId}`
        }
        showsVerticalScrollIndicator={false}
        // Automatic focus refetch must not activate the native pull-to-refresh offset.
        refreshing={pullRefreshTab === activeTab}
        onRefresh={() => { void handlePullRefresh(); }}
        contentContainerStyle={{
          paddingBottom: bottomPadding,
        }}
        ListHeaderComponent={
          <View
            style={[
              contentContainerStyle,
              styles.header,
              { paddingTop: mainTabTopPadding(insets.top) - insets.top },
            ]}
          >
            <MatchingHeader
              onRefresh={() => {
                void refresh();
              }}
              isRefreshing={requestsQuery.isFetching || roomsQuery.isFetching}
            />
            <View style={styles.inboxControls}>
              <MatchingActionButtons
                activeTab={activeTab}
                onChangeTab={changeTab}
                unreadCount={unreadCount}
                requestCount={requestsQuery.data?.requests.length}
              />
              {activeTab === 'chat' && rooms.length > 0 && (
                <View style={styles.filters}>
                  {[
                    { value: false, label: '전체 대화' },
                    { value: true, label: `안 읽음 ${unreadRooms.length}` },
                  ].map((filter) => (
                    <Pressable
                      key={filter.label}
                      onPress={() => setUnreadOnly(filter.value)}
                      accessibilityRole="button"
                      accessibilityLabel={filter.label}
                      accessibilityState={{
                        selected: unreadOnly === filter.value,
                      }}
                      style={[
                        styles.filter,
                        {
                          borderColor:
                            unreadOnly === filter.value
                              ? palette.buttonBorder
                              : colors.border.primary,
                          backgroundColor:
                            unreadOnly === filter.value
                              ? palette.buttonBase
                              : colors.background.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.copy,
                          {
                            color:
                              unreadOnly === filter.value
                                ? palette.onAccent
                                : colors.text.secondary,
                          },
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {query.isError && query.data && (
                <Text
                  accessibilityRole="alert"
                  style={[styles.copy, { color: colors.state.danger }]}
                >
                  최신 목록을 확인하지 못했어요. 기존 목록을 보여드리고 있어요.
                  위에서 다시 불러올 수 있어요.
                </Text>
              )}
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={[contentContainerStyle, styles.padded]}>
            {item.kind === 'request' ? (
              <MeetingRequestCard
                request={item.request}
                onDetails={() => {
                  if (!lock.current) {
                    setSelectedId(item.request.requestId);
                    setActionError(null);
                  }
                }}
                onAccept={() => {
                  void respond(item.request, 'accept');
                }}
                disabled={!!action}
                accepting={
                  action?.requestId === item.request.requestId &&
                  action.kind === 'accept'
                }
              />
            ) : (
              <MatchingChatItem data={item.room} />
            )}
          </View>
        )}
        ListFooterComponent={<View style={[contentContainerStyle, styles.preferences, { borderColor: colors.border.primary }]}><MatchingActiveStatus compact /></View>}
        ListEmptyComponent={
          <View style={[contentContainerStyle, styles.padded]}>{empty}</View>
        }
      />
      {selected && (
        <MeetingRequestDetail
          key={`${userUuid}:${selected.requestId}`}
          request={selected}
          busy={!!action}
          action={action?.kind ?? null}
          error={actionError}
          onClose={() => {
            if (!lock.current) setSelectedId(null);
          }}
          onAccept={() => {
            void respond(selected, 'accept');
          }}
          onReject={() => {
            void respond(selected, 'reject');
          }}
          onCall={() => {
            void respond(selected, 'call');
          }}
        />
      )}
    </SafeAreaView></ProfileImageReloadContext.Provider>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xs,
    gap: Spacing.lg,
  },
  inboxControls: { gap: Spacing.xs },
  padded: { paddingHorizontal: Spacing.xxl },
  preferences: { marginTop: Spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, paddingHorizontal: Spacing.sm },
  copy: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 23,
  },
  separator: { height: Spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  filter: {
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
