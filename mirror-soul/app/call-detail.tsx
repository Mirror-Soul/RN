import CallDetailAlert from '@/src/components/home/history/detail/CallDetailAlert';
import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailFooter from '@/src/components/home/history/detail/CallDetailFooter';
import CallDetailHeader from '@/src/components/home/history/detail/CallDetailHeader';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useCallDetail } from '@/src/features/history/hooks/useCallDetail';
import { useCallDetailGlow } from '@/src/features/history/hooks/useCallDetailGlow';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';
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

  // 히스토리가 없는 상태(딥링크/푸시 알림으로 바로 진입 등)에서 router.back()은 아무 동작도
  // 안 할 수 있다 — 공용 Header의 내부 fallback과 동일한 안전장치를 여기(Header를 안 쓰는
  // 화면)에도 맞춰준다.
  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)');
    }
  };

  // callId 자체가 잘못된 경로면 재시도로 복구할 방법이 없으므로, 네트워크 에러(재시도 가능)와
  // 구분해 뒤로가기만 안내한다.
  if (!isValidCallId) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text.muted }]}>잘못된 통화 기록입니다.</Text>
        <TouchableOpacity onPress={handleSafeBack} accessibilityRole="button" accessibilityLabel="뒤로가기">
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
      {/* 배경 glow — message-room과 같은 컨셉(은은한 펄스)이지만, shadowRadius는 Android에서
          전혀 렌더링되지 않아(RN 공식 문서) 대신 react-native-svg의 RadialGradient로 그린다.
          펄스 애니메이션은 그대로 Animated.View의 opacity로 처리한다. */}
      <View style={styles.background} pointerEvents="none">
        <Animated.View style={[styles.glowLeft, glowLeftStyle]}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="glowLeftGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgb(0, 184, 219)" stopOpacity={1} />
                <Stop offset="100%" stopColor="rgb(0, 184, 219)" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="50%" cy="50%" r="50%" fill="url(#glowLeftGradient)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.glowRight, glowRightStyle]}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="glowRightGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgb(173, 70, 255)" stopOpacity={1} />
                <Stop offset="100%" stopColor="rgb(173, 70, 255)" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="50%" cy="50%" r="50%" fill="url(#glowRightGradient)" />
          </Svg>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.contentWrapper, contentContainerStyle]}>
          <CallDetailHeader
            name={data.partner.name}
            profileImageUrl={data.partner.profileImageUrl}
            description={data.description}
            callNumber={data.callNumber}
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
    top: 0,
    left: '25%',
  },
  glowRight: {
    position: 'absolute',
    width: 256,
    height: 256,
    bottom: 200,
    right: '15%',
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
