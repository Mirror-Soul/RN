import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

type BadgeVariant = 'solid' | 'glass' | 'outline' | 'gradient';
type BadgeColor = 'cyan' | 'purple' | 'gray' | 'gold';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  colorScheme?: BadgeColor;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * 전역 디자인 시스템 - Badge
 * 
 * 프로필, 매칭 카드, 태그 등에서 공통으로 사용되는 뱃지 컴포넌트입니다.
 */
export const Badge = ({
  label,
  variant = 'glass',
  colorScheme = 'cyan',
  size = 'md',
  icon,
  style,
  textStyle,
}: BadgeProps) => {
  const { colors } = useThemeColors();

  // 1. 사이즈 스타일 결정
  const sizeStyles = {
    sm: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 10, lineHeight: 14 },
    md: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12, lineHeight: 16 },
  }[size];

  // 2. 컬러 스킴 결정
  const getColorStyles = () => {
    switch (colorScheme) {
      case 'cyan':
        return {
          solidBg: Colors.primary.electricCyan,
          glassBg: Colors.glass.cyan20_d3,
          glassBorder: Colors.glass.cyan20_d3,
          text: variant === 'solid' || variant === 'gradient' ? '#FFFFFF' : Colors.primary.electricCyan,
        };
      case 'purple':
        return {
          solidBg: Colors.primary.vividPurple,
          glassBg: Colors.glass.purple20,
          glassBorder: Colors.glass.purple20,
          text: variant === 'solid' || variant === 'gradient' ? '#FFFFFF' : Colors.primary.vividPurple,
        };
      case 'gold':
        return {
          solidBg: Colors.primary.goldText,
          glassBg: Colors.glass.gold20,
          glassBorder: Colors.glass.gold40,
          text: variant === 'solid' || variant === 'gradient' ? '#141414' : Colors.primary.goldText,
        };
      case 'gray':
      default:
        return {
          solidBg: colors.text.secondary,
          glassBg: colors.background.glass,
          glassBorder: colors.border.primary,
          text: variant === 'solid' || variant === 'gradient' ? '#FFFFFF' : colors.text.secondary,
        };
    }
  };

  const scheme = getColorStyles();

  // 3. Variant 조합
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: 999, // Pill 형태
  };

  if (variant === 'solid') {
    containerStyle.backgroundColor = scheme.solidBg;
  } else if (variant === 'glass') {
    containerStyle.backgroundColor = scheme.glassBg;
    containerStyle.borderWidth = 1;
    containerStyle.borderColor = scheme.glassBorder;
  } else if (variant === 'outline') {
    containerStyle.backgroundColor = 'transparent';
    containerStyle.borderWidth = 1;
    containerStyle.borderColor = scheme.solidBg;
  }

  // 렌더링 로직 (Gradient 분기)
  if (variant === 'gradient' && (colorScheme === 'cyan' || colorScheme === 'purple')) {
    return (
      <LinearGradient
        colors={colorScheme === 'cyan' ? Colors.gradient.twinProgress : Colors.gradient.voiceStart}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[containerStyle, style]}
      >
        {icon}
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize, lineHeight: sizeStyles.lineHeight, color: scheme.text }, textStyle]}>
          {label}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {icon}
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize, lineHeight: sizeStyles.lineHeight, color: scheme.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: FontFamily.sans,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
});
