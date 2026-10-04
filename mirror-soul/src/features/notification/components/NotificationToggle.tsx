import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  value: boolean | null;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
}

/** OS 표준 스위치와 상태 문구를 함께 사용해 색상만으로 상태를 구분하지 않는다. */
export function NotificationToggle({ value, onToggle, label, disabled = false, isSaving = false, isLoading = false }: Props) {
  const { colors } = useThemeColors();
  const blocked = disabled || value === null || isSaving;
  // 다른 항목의 저장으로 입력만 잠길 때는 이 스위치의 모습은 유지한다.
  const visuallyDisabled = value === null || isSaving;
  const stateLabel = isSaving ? '저장 중' : value === null ? isLoading ? '확인 중' : '확인 필요' : value ? '켜짐' : '꺼짐';
  return (
    <Pressable onPress={onToggle} disabled={blocked} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value ?? undefined, disabled: blocked, busy: isSaving || isLoading }} style={[styles.control, visuallyDisabled && styles.disabled]}>
      <Text style={[styles.state, { color: value ? colors.brand.accent : colors.text.secondary }]}>{stateLabel}</Text>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {value === null && isLoading ? <ActivityIndicator style={styles.loading} color={colors.brand.accent} /> : <Switch accessible={false} value={value ?? false} disabled={visuallyDisabled} trackColor={{ false: colors.border.strong, true: colors.brand.accent }} thumbColor="#FFFFFF" ios_backgroundColor={colors.background.glass} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: { minHeight: 48, minWidth: 108, flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'flex-end', paddingVertical: Spacing.xs },
  state: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21, fontWeight: FontWeight.medium },
  loading: { width: 51, height: 31 },
  disabled: { opacity: 0.6 },
});
