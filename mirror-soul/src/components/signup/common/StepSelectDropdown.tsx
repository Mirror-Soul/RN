import BottomNarrowIcon from '@/assets/images/common/Bottom_narrow.svg';
import TopNarrowIcon from '@/assets/images/common/Top_narrow.svg';
import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface Props {
  label: string;
  placeholder: string;
  onPress: () => void;
  style?: ViewStyle;
  isOpen?: boolean;
}

/**
 * 회원가입 단계에서 공통으로 사용하는 드롭다운 선택 필드 모조 컴포넌트
 */
export default function StepSelectDropdown({ label, placeholder, onPress, style, isOpen = false }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={label}
      >
        <Text style={styles.placeholder}>{placeholder}</Text>
        {isOpen ? (
          <TopNarrowIcon width={24} height={24} />
        ) : (
          <BottomNarrowIcon width={24} height={24} />
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
  label: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  button: {
    width: '100%',
    height: 49,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  placeholder: {
    color: Colors.neutral.darkGray,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  }
});
