import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MessageRoomScreen from '@/src/features/message-room/MessageRoomScreen';
import { useChatRoomsQuery } from '@/src/features/chat/hooks/useChatRoomsQuery';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

/**
 * 메시지방 상세 화면 (루트 Stack 레벨)
 * MatchingChatItem 탭 시 진입하며, BottomNavbar 없이 풀스크린으로 표시됩니다.
 * 방 메타데이터는 useChatRoomsQuery 캐시에서 찾는다 — 목록 화면에서 넘어온 경우 이미 캐시가
 * 따뜻해 즉시 뜨고, 푸시 알림 등으로 콜드 진입한 경우에만 실제로 새로 조회한다.
 * 차단된 상대의 방은 이 쿼리 자체에 안 잡히므로(백엔드가 쿼리 단계에서 제외) 별도
 * 차단 여부 체크가 필요 없다 — 그런 방은 그냥 "찾을 수 없음"으로 자연스럽게 처리된다.
 */
export default function MessageRoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useChatRoomsQuery();

  const room = data?.rooms.find((r) => r.chatRoomId === Number(id));

  if (isLoading) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary.electricCyan} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>대화방 정보를 불러오지 못했습니다.</Text>
        <Pressable onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="다시 시도">
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>대화방을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return <MessageRoomScreen room={room} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    color: Colors.primary.electricCyan,
  },
});
