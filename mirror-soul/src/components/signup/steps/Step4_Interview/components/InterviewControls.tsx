import React from 'react';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  isRecording: boolean;
  hasRecording: boolean;
  isBusy: boolean;
  isNextDisabled: boolean;
  isRecordDisabled?: boolean;
  isLastQuestion: boolean;
  busyLabel?: string;
  needsConfirmation?: boolean;
  onRecordPress: () => void;
  onNextPress: () => void;
}

export default function InterviewControls({ isRecording, hasRecording, isBusy, isNextDisabled, isRecordDisabled = false, isLastQuestion, busyLabel, needsConfirmation, onRecordPress, onNextPress }: Props) {
  const { colors, isDark } = useThemeColors();
  const showSave = hasRecording && !isRecording;
  const recordLabel = isBusy && !showSave ? (isRecording ? '답변 정리 중…' : '녹음 준비 중…') : isRecording ? '녹음 마치고 확인' : hasRecording ? '다시 녹음' : '답변 녹음하기';
  const recordPrimary = !showSave;
  const foreground = isRecording ? Colors.neutral.pureWhite : recordPrimary ? (isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite) : colors.text.primary;
  return (
    <View style={styles.container}>
      {showSave && <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isNextDisabled || isBusy, busy: isBusy }}
        disabled={isNextDisabled || isBusy}
        onPress={onNextPress}
        style={[styles.button, { backgroundColor: colors.brand.accent, opacity: isNextDisabled || isBusy ? 0.5 : 1 }]}
      >
        <Text style={[styles.label, { color: isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite }]}>
          {needsConfirmation ? '내용 확인 후 저장' : isLastQuestion ? '답변 저장하고 계속' : '답변 저장하고 다음'}
        </Text>
        <Feather name="arrow-right" size={19} color={isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite} />
      </Pressable>}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: isBusy || isRecordDisabled, busy: isBusy }} disabled={isBusy || isRecordDisabled} onPress={onRecordPress}
        style={[styles.button, {
          backgroundColor: isRecording ? colors.state.danger : recordPrimary ? colors.brand.accent : colors.background.card,
          borderColor: colors.border.primary, borderWidth: recordPrimary ? 0 : 1, opacity: isBusy || isRecordDisabled ? 0.5 : 1,
        }]}
      >
        <Feather name={isRecording ? 'square' : hasRecording ? 'rotate-ccw' : 'mic'} size={19} color={foreground} />
        <Text style={[styles.label, { color: foreground }]}>{recordLabel}</Text>
      </Pressable>
      {isBusy && <View accessibilityLiveRegion="polite" style={styles.busyRow}>
        <ActivityIndicator size="small" color={colors.brand.accent} />
        <Text style={[styles.busyText, { color: colors.text.secondary }]}>{busyLabel || '잠시만 기다려주세요…'}</Text>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: Spacing.sm },
  button: { minHeight: 56, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderRadius: Radii.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  label: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, flexShrink: 1, textAlign: 'center' },
  busyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  busyText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, flexShrink: 1 },
});
