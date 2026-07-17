import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import {Colors, FontFamily, FontSize, FontWeight} from '@/src/constants/theme';

interface FormLabelProps {
  label: string;
}

/**
 * FormLabel 컴포넌트
 * 이메일, 비밀번호 등 각 섹션 상단의 레이블. (SRP)
 */
export default function FormLabel({ label }: FormLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  text: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
