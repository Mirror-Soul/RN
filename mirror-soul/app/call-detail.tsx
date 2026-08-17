import CallDetailAlert from '@/src/components/home/history/detail/CallDetailAlert';
import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailFooter from '@/src/components/home/history/detail/CallDetailFooter';
import CallDetailHeader from '@/src/components/home/history/detail/CallDetailHeader';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useCallDetail } from '@/src/features/history/hooks/useCallDetail';
import { useCallDetailGlow } from '@/src/features/history/hooks/useCallDetailGlow';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 통화 기록 상세 화면 (루트 스택 레벨)
 * HistoryCallCard 탭 시 진입하며, BottomNavbar 없이 풀스크린으로 표시됩니다.
 * 읽기 전용 통화 기록 + Twin 답변 수정 화면입니다. (실시간 채팅 없음)
 */
export default function CallDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentContainerStyle } = useLayout();
  const { colors, isDark } = useThemeColors();
  const { glowLeftStyle, glowRightStyle } = useCallDetailGlow(isDark);
  const { id } = useLocalSearchParams<{ id: string }>();
  const callId = Number(id);
  const isValidCallId = Number.isSafeInteger(callId) && callId > 0;
  const { data, isLoading, isError, refetch, updateTalkLog, isSaving } = useCallDetail(callId);

  // 통화/더보기 실제 기능은 앱 어디에도 아직 없다(Discovery의 "통화하기"도 동일하게 스텁 상태) —
  // 같은 패턴으로 안내만 하고, 실제 연동은 별도 후속 작업으로 분리한다.
  const handleCallPress = () => {
    Alert.alert('안내', '통화하기 기능은 곧 제공될 예정입니다.');
  };

  const handleMorePress = () => {
    Alert.alert('안내', '더보기 기능은 곧 제공될 예정입니다.');
  };

  // callId 자체가 잘못된 경로면 재시도로 복구할 방법이 없으므로, 네트워크 에러(재시도 가능)와
  // 구분해 뒤로가기만 안내한다.
  if (!isValidCallId) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text.muted }]}>잘못된 통화 기록입니다.</Text>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로가기">
          <Text style={[styles.errorText, styles.retryText]}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary.electricCyan} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text.muted }]}>통화 기록을 불러오지 못했습니다.</Text>
        <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="다시 시도">
          <Text style={[styles.errorText, styles.retryText]}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* 배경 glow — message-room과 동일 기법(blur 흉내용 shadowRadius), 라이트 모드에선 더 옅게 */}
      <View style={styles.background} pointerEvents="none">
        <Animated.View style={[styles.glowLeft, glowLeftStyle]} />
        <Animated.View style={[styles.glowRight, glowRightStyle]} />
      </View>

      <KeyboardAvoidingView
        style={[styles.flex, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.contentWrapper, contentContainerStyle]}>
          <CallDetailHeader
            name={data.partner.name}
            profileImageUrl={data.partner.profileImageUrl}
            description={data.description}
            callNumber={data.callNumber}
            onBack={() => router.back()}
            onCallPress={handleCallPress}
            onMorePress={handleMorePress}
          />
          <CallDetailAlert name={data.partner.name} twinSyncRate={data.partner.twinSyncRate} />
          <CallDetailBody
            key={data.callId}
            talkLogs={data.talkLogs}
            partnerName={data.partner.name}
            partnerProfileImageUrl={data.partner.profileImageUrl}
            onSaveTalkLog={updateTalkLog}
            isSaving={isSaving}
          />
          <View style={{ paddingBottom: insets.bottom }}>
            <CallDetailFooter />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowLeft: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0, 184, 219, 1)',
    top: 0,
    left: '25%',
    shadowColor: 'rgba(0, 184, 219, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 0,
  },
  glowRight: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(173, 70, 255, 1)',
    bottom: 200,
    right: '15%',
    shadowColor: 'rgba(173, 70, 255, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 0,
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
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
  },
  retryText: {
    color: Colors.primary.electricCyan,
    fontWeight: FontWeight.semibold,
  },
});
