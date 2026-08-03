import CallDetailAlert from '@/src/components/home/history/detail/CallDetailAlert';
import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailFooter from '@/src/components/home/history/detail/CallDetailFooter';
import CallDetailHeader from '@/src/components/home/history/detail/CallDetailHeader';
import { Colors, FontSize, Spacing } from '@/src/constants/theme';
import { MOCK_CALL_HISTORY } from '@/src/mocks/historyMocks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';

/**
 * 통화 기록 상세 화면 (루트 스택 레벨)
 * HistoryCallCard 탭 시 진입하며, BottomNavbar 없이 풀스크린으로 표시됩니다.
 * 읽기 전용 통화 기록 + Twin 답변 수정 화면입니다. (실시간 채팅 없음)
 */
export default function CallDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentContainerStyle } = useLayout();
  const { id } = useLocalSearchParams<{ id: string }>();

  // id로 통화 데이터 조회 (API 연동 시 useQuery 등으로 교체)
  const callItem = MOCK_CALL_HISTORY.find((item) => item.id === id);

  if (!callItem) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>통화 기록을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.contentWrapper, contentContainerStyle]}>
        <CallDetailHeader
          name={callItem.name}
          age={callItem.age}
          consistencyPercent={callItem.consistencyPercent}
          isOnline={false} // API 연동 시 실제 온라인 상태로 교체
          onBack={() => router.back()}
          onCallPress={() => {/* 향후 통화 기능 연동 */}}
          onMorePress={() => {/* 향후 더보기 메뉴 연동 */}}
        />
        <CallDetailAlert />
        <CallDetailBody key={callItem.id} initialMessages={callItem.messages} />
        <View style={{ paddingBottom: insets.bottom }}>
          <CallDetailFooter />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  contentWrapper: {
    flex: 1,
  },
  errorText: {
    color: '#99A1AF',
    textAlign: 'center',
    marginTop: Spacing.giant,
    fontFamily: 'Inter',
    fontSize: FontSize.base,
  },
});
