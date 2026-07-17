import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import ContinueIcon from '@/assets/images/common/Continue_icon.svg';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  isLoading?: boolean;
  /**
   * 'full'  — width: '100%' (온보딩 스텝, 회원가입 탭 등)
   * 'fixed' — Math.min(screenWidth - 32, 345) (로그인 화면 등)
   * @default 'full'
   */
  variant?: 'full' | 'fixed';
  /**
   * ContinueIcon(→) 표시 여부
   * @default true
   */
  showIcon?: boolean;
}

/**
 * GradientButton 컴포넌트
 * 프로젝트 전역 공용 그라디언트 CTA 버튼.
 * (이전 AuthButton + PrimaryButton 통합)
 *
 * - variant='full'  → width: '100%'
 * - variant='fixed' → useWindowDimensions 기반 최대 345px
 * - disabled 시 그라디언트 제거, 텍스트/아이콘 비활성 컬러
 */
export default function GradientButton({
  title,
  onPress,
  style,
  disabled = false,
  isLoading = false,
  variant = 'full',
  showIcon = true,
}: GradientButtonProps) {
  const { width: windowWidth } = useWindowDimensions();

  // variant='fixed'일 때만 동적 너비 계산 (불필요한 계산 방지)
  const buttonWidth =
    variant === 'fixed' ? Math.min(windowWidth - 32, 345) : undefined;

  const isDisabled = disabled || isLoading;

  const handlePress = useCallback(() => {
    if (!isDisabled) onPress();
  }, [isDisabled, onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        variant === 'full' ? styles.fullWidth : { width: buttonWidth, alignSelf: 'center' },
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
    >
      {/* 활성 상태에서만 그라디언트 렌더링 */}
      {!isDisabled && (
        <LinearGradient
          colors={Colors.gradient.limeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radii.lg }]}
        />
      )}

      {/* iOS 그림자 (활성 상태에서만) */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isDisabled ? Colors.neutral.disabledText : Colors.primary.soulBlack}
        />
      ) : (
        <>
          <Text style={[styles.text, isDisabled ? styles.textDisabled : styles.textActive]}>
            {title}
          </Text>
          {showIcon && <ContinueIcon width={24} height={24} />}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    // iOS Shadow (활성 상태 공통 — 그라디언트와 함께 보임)
    shadowColor: 'rgba(173, 70, 255, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  fullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: Colors.glass.white5,
    // 그림자 제거
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    letterSpacing: -0.312,
    textAlign: 'center',
    zIndex: 1,
  },
  textActive: {
    color: Colors.primary.soulBlack,
  },
  textDisabled: {
    color: Colors.neutral.disabledText,
  },
});
