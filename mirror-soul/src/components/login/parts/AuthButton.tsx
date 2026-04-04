import ContinueIcon from '@/assets/images/common/Continue_icon.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * AuthButton 컴포넌트
 * 로그인 및 회원가입 시 사용되는 그라데이션 배경과 그림자가 적용된 메인 버튼.
 */
export default function AuthButton({ title, onPress, style }: AuthButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.buttonWrapper, style]}
    >
      <LinearGradient
        colors={Colors.gradient.cyanToPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{title}</Text>
        <ContinueIcon width={24} height={24} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: 344.94,
    height: 56,
    borderRadius: Radii.lg,
    // iOS Shadow
    shadowColor: 'rgba(173, 70, 255, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    // Android Shadow
    elevation: 8,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.lg,
    gap: 8,
  },
  text: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
    textAlign: 'center',
  },
});
