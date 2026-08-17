import CallDetailAlert from '@/src/components/home/history/detail/CallDetailAlert';
import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailFooter from '@/src/components/home/history/detail/CallDetailFooter';
import CallDetailHeader from '@/src/components/home/history/detail/CallDetailHeader';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useCallDetail } from '@/src/features/history/hooks/useCallDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
  const callId = Number(id);
  const isValidCallId = Number.isSafeInteger(callId) && callId > 0;
  const { data, isLoading, isError, refetch, updateTalkLog, isSaving } = useCallDetail(callId);

  // callId 자체가 잘못된 경로면 재시도로 복구할 방법이 없으므로, 네트워크 에러(재시도 가능)와
  // 구분해 뒤로가기만 안내한다.
  if (!isValidCallId) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>잘못된 통화 기록입니다.</Text>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로가기">
          <Text style={[styles.errorText, styles.retryText]}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary.electricCyan} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>통화 기록을 불러오지 못했습니다.</Text>
        <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="다시 시도">
          <Text style={[styles.errorText, styles.retryText]}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.contentWrapper, contentContainerStyle]}>
        <CallDetailHeader
          name={data.partner.name}
          age={data.partner.age}
          consistencyPercent={data.partner.twinSyncRate}
          isOnline={false} // API 연동 시 실제 온라인 상태로 교체
          onBack={() => router.back()}
          onCallPress={() => {/* 향후 통화 기능 연동 */}}
          onMorePress={() => {/* 향후 더보기 메뉴 연동 */}}
        />
        <CallDetailAlert />
        <CallDetailBody
          key={data.callId}
          talkLogs={data.talkLogs}
          onSaveTalkLog={updateTalkLog}
          isSaving={isSaving}
        />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contentWrapper: {
    flex: 1,
  },
  errorText: {
    color: '#99A1AF',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: FontSize.base,
  },
  retryText: {
    color: Colors.primary.electricCyan,
    fontWeight: FontWeight.semibold,
  },
});
