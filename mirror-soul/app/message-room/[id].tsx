import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MessageRoomScreen from '@/src/features/message-room/MessageRoomScreen';
import { MOCK_CHAT_ROOMS } from '@/src/mocks/messageMocks';
import { Colors, FontFamily, FontSize, Spacing } from '@/src/constants/theme';
import { isRoomBlocked } from '@/src/utils/blockList';

/**
 * 메시지방 상세 화면 (루트 Stack 레벨)
 * MatchingChatItem 탭 시 진입하며, BottomNavbar 없이 풀스크린으로 표시됩니다.
 */
export default function MessageRoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [blocked, setBlocked] = useState<boolean | null>(null);

  const room = MOCK_CHAT_ROOMS.find((r) => r.id === id);

  useEffect(() => {
    if (!room) return;
    isRoomBlocked(room.id).then(setBlocked);
  }, [room]);

  if (!room) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>대화방을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  // 차단 여부 확인 전에는 아무것도 그리지 않아 잠깐이라도 차단된 대화가 보이지 않게 한다.
  if (blocked === null) {
    return null;
  }

  if (blocked) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>차단한 대화 상대입니다.</Text>
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
  },
  errorText: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginTop: Spacing.giant,
  },
});
