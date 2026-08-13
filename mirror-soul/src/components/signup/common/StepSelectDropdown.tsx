import BottomNarrowIcon from '@/assets/images/common/Bottom_narrow.svg';
import TopNarrowIcon from '@/assets/images/common/Top_narrow.svg';
import {FontFamily, FontSize, FontWeight} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import FormLabel from './FormLabel';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  label: string;
  placeholder: string;
  /** placeholder가 실제 선택값을 담고 있는지 여부 — true면 밝은 텍스트, false면 흐린 플레이스홀더 톤으로 표시 */
  hasValue?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  isOpen?: boolean;
}

/**
 * 회원가입 단계에서 공통으로 사용하는 드롭다운 선택 필드.
 * 박스형 대신 하단 보더 한 줄만 있는 미니멀 스타일.
 */
export default function StepSelectDropdown({ label, placeholder, hasValue = false, onPress, style, isOpen = false }: Props) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      {label ? <FormLabel label={label} /> : null}
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.border.primary }]}
        activeOpacity={0.7}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={label || placeholder}
      >
        <Text
          style={[styles.value, { color: hasValue ? colors.text.primary : colors.text.muted }]}
          numberOfLines={1}
        >
          {placeholder}
        </Text>
        {isOpen ? (
          <TopNarrowIcon width={18} height={18} />
        ) : (
          <BottomNarrowIcon width={18} height={18} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  value: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
});
