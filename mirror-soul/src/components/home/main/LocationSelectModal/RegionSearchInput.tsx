import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface RegionSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

/** 활성 시/도 안에서 구/군 이름을 검색하는 입력창. 값이 있을 때만 지우기 버튼을 보여준다. */
export default function RegionSearchInput({ value, onChangeText, placeholder }: RegionSearchInputProps) {
  const { colors } = useThemeColors();

  return (
    <View
      style={[styles.box, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
    >
      <Feather name="search" size={16} color={colors.text.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        style={[styles.input, { color: colors.text.primary }]}
        accessibilityLabel="구/군 검색"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
        >
          <Feather name="x-circle" size={16} color={colors.text.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: 44,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    padding: 0,
  },
});
