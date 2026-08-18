import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface GrowDoneActionRowProps {
  retryLabel: string;
  onRetry: () => void;
  completeLabel?: string;
  showCompleteIcon?: boolean;
}

/**
 * 캡처 완료 후 "다시 하기 / 완료하기" 2버튼 액션 로우 (SRP)
 * FaceDataCaptureButton과 VoiceUpdateButton의 done 상태가 동일한 마크업/스타일을 썼던 걸
 * 공유 컴포넌트로 뽑았다. "완료하기"는 두 화면 모두 단순 뒤로가기라 여기서 직접 처리한다.
 */
export default function GrowDoneActionRow({
  retryLabel,
  onRetry,
  completeLabel = '완료하기',
  showCompleteIcon = false,
}: GrowDoneActionRowProps) {
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onRetry}
        style={[styles.actionChip, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      >
        <Text style={[styles.actionChipText, { color: colors.text.secondary }]}>{retryLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.back()}
        style={[styles.actionChip, styles.primaryChip]}
      >
        {showCompleteIcon && <Feather name="check" size={16} color={Colors.primary.electricCyan} />}
        <Text style={[styles.actionChipText, styles.primaryChipText]}>{completeLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.full,
    borderWidth: 0.6,
  },
  actionChipText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    letterSpacing: -0.3,
  },
  primaryChip: {
    backgroundColor: 'rgba(0, 211, 243, 0.15)',
    borderColor: 'rgba(0, 211, 243, 0.3)',
  },
  primaryChipText: {
    color: Colors.primary.electricCyan,
    fontWeight: FontWeight.semibold,
  },
});
