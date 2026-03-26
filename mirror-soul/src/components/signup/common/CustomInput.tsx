import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
}

/**
 * 공통 재사용 입력 폼 컴포넌트 (라벨 + 텍스트 인풋)
 */
export default function CustomInput({ label, containerStyle, style, ...props }: CustomInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[styles.input, style]}
        placeholderTextColor={Colors.neutral.darkGray}
        {...props}
      />
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
  input: {
    width: '100%',
    height: 49,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 0.6,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    color: Colors.neutral.pureWhite,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.312,
  }
});
