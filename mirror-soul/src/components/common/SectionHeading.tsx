import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import {FontFamily, FontSize, FontWeight} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface SectionHeadingProps extends TextProps {
  title: string;
}

/**
 * 전역 디자인 시스템 - Section Heading
 * 
 * 고객센터, 설정 탭 등에서 섹션을 구분하기 위해 사용되는 
 * Uppercase, 넓은 자간을 가진 작은 회색 텍스트 컴포넌트입니다.
 */
export const SectionHeading = ({ title, style, ...props }: SectionHeadingProps) => {
  const { colors } = useThemeColors();

  return (
    <Text 
      style={[
        styles.heading, 
        { color: colors.text.secondary },
        style
      ]} 
      {...props}
    >
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
