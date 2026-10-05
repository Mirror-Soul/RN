import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatVoiceCooldown } from './readingSimilarity';

export type VoiceUpdateIdleStatusVariant = 'ready' | 'cooldown' | 'checking' | 'checkFailed';

interface VoiceUpdateIdleStatusProps {
  status: VoiceUpdateIdleStatusVariant;
  /** status가 'cooldown'일 때만 의미가 있다. */
  cooldownRemainingSeconds?: number;
  /** status가 'checkFailed'일 때, 재시도 요청이 진행 중이면 true. */
  isRetrying?: boolean;
  /** status가 'checkFailed'일 때 탭하면 호출된다. */
  onRetryCooldownCheck?: () => void;
}

/**
 * VoiceUpdateButton의 idle 상태 4개 하위분기(녹음 준비/쿨다운/확인 중/확인 실패) 표시만
 * 담당하는 컴포넌트 (SRP) — 어느 분기인지는 부모가 이미 판별해서 status로 넘겨주므로,
 * 여기서는 배타조건을 다시 따지지 않는다.
 */
export default function VoiceUpdateIdleStatus({
  status,
  cooldownRemainingSeconds,
  isRetrying,
  onRetryCooldownCheck,
}: VoiceUpdateIdleStatusProps) {
  const { colors } = useThemeColors();

  if (status === 'cooldown') {
    return (
      <View style={styles.idleInfo}>
        <Text style={[styles.statusText, { color: colors.text.primary }]}>다음 녹음까지 {formatVoiceCooldown(cooldownRemainingSeconds ?? 0)}</Text>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>녹음은 2분 간격으로 보낼 수 있어요.</Text>
      </View>
    );
  }

  if (status === 'checkFailed') {
    return (
      <TouchableOpacity
        style={styles.idleInfo}
        onPress={onRetryCooldownCheck}
        disabled={isRetrying}
        accessibilityRole="button"
        accessibilityLabel="쿨다운 확인 다시 시도"
        accessibilityState={{ busy: isRetrying }}
      >
        {isRetrying ? (
          <ActivityIndicator color={colors.state.danger} />
        ) : (
          <>
            <Text style={[styles.statusText, { color: colors.state.danger }]}>녹음 가능 여부를 확인하지 못했어요</Text>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>탭하여 다시 확인하기</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (status === 'checking') {
    return (
      <View style={styles.idleInfo}>
        <Text style={[styles.statusText, { color: colors.text.primary }]}>확인하는 중이에요</Text>
        <Text style={[styles.footerText, { color: colors.text.secondary }]}>잠시만 기다려주세요</Text>
      </View>
    );
  }

  return (
    <View style={styles.idleInfo}>
      <Text style={[styles.statusText, { color: colors.text.primary }]}>녹음 시작</Text>
      <Text style={[styles.footerText, { color: colors.text.secondary }]}>다 읽은 뒤 같은 버튼을 눌러 확인해요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  idleInfo: {
    alignItems: 'stretch',
    gap: Spacing.xs,
    alignSelf: 'stretch',
  },
  statusText: {
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  footerText: {
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 21,
  },
});
