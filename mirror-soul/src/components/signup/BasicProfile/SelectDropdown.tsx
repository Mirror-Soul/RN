import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/src/constants/theme';
import CompleteIcon from '@/assets/images/common/Complete.svg';

interface SelectDropdownProps {
  label: string;
  placeholder: string;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * Basic Profile 드롭다운 인풋 모조 컴포넌트
 */
export default function SelectDropdown({ label, placeholder, onPress, style }: SelectDropdownProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.button}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Text style={styles.placeholder}>{placeholder}</Text>
        <CompleteIcon width={24} height={24} /> 
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
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
