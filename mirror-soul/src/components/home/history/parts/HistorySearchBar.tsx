import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface HistorySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * 통화 기록 검색 인풋 컴포넌트 (SRP)
 * 포커스 시 electricCyan 테두리로 강조합니다.
 */
export default function HistorySearchBar({
  value,
  onChangeText,
  placeholder = '대화 내용 검색',
}: HistorySearchBarProps) {
  const { colors } = useThemeColors();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.glass, borderColor: isFocused ? Colors.primary.electricCyan : colors.border.primary },
      ]}
    >
      <Feather
        name="search"
        size={14}
        color={isFocused ? Colors.primary.electricCyan : colors.text.muted}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[styles.input, { color: colors.text.primary }]}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    padding: 0, // iOS 기본 패딩 제거
  },
});
