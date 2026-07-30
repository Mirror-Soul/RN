import React from 'react';
import {FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  /** 뒤로가기 버튼 우측에 들어갈 커스텀 콘텐츠 (아바타+이름 등). 지정 시 title은 숨겨집니다. */
  leftContent?: React.ReactNode;
  rightElement?: React.ReactNode;
  delay?: number;
  /** 외부에서 배경색을 지정할 때 사용합니다 */
  backgroundColor?: string;
  /** 하단 보더 색상 (기본: 없음) */
  borderBottomColor?: string;
}

export const Header = ({ 
  title, 
  showBackButton = true, 
  onBackPress, 
  leftContent,
  rightElement,
  delay = 0,
  backgroundColor,
  borderBottomColor,
}: HeaderProps) => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      // Header는 인증 후 (main) 화면들에서만 쓰이므로, 히스토리가 없을 때의 안전한 기본값은 홈이다.
      router.replace('/(main)'); // Fallback if no history
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={[
        styles.header,
        { paddingTop: insets.top + 16 },
        backgroundColor ? { backgroundColor } : undefined,
        borderBottomColor ? { borderBottomWidth: 1, borderBottomColor } : undefined,
      ]}
    >
      {/* 좌측: 뒤로가기 버튼 */}
      {showBackButton ? (
        <Pressable 
          onPress={handleBack}
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <View style={[styles.backButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
            <Feather name="arrow-left" size={20} color={colors.text.primary} />
          </View>
        </Pressable>
      ) : (
        <View style={styles.emptySlot} />
      )}

      {/* 중앙: leftContent가 있으면 커스텀 콘텐츠, 없으면 title 텍스트 */}
      {leftContent ? (
        <View style={styles.leftContentArea}>
          {leftContent}
        </View>
      ) : (
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {title}
        </Text>
      )}

      {/* 우측: rightElement 슬롯 */}
      <View style={styles.rightSlot}>
        {rightElement}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg2,
    borderWidth: 0.61,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    letterSpacing: -0.44,
    textAlign: 'center',
  },
  /** leftContent 사용 시 flex:1 으로 빈 공간을 모두 채움 */
  leftContentArea: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  emptySlot: {
    width: 40,
    alignItems: 'flex-end',
  },
  /** rightElement 슬롯 — 콘텐츠가 없을 때도 backButton(40px)과 동일한 최소 너비를 확보해
   *  title이 진짜 중앙에 오도록 한다. rightElement가 이보다 넓으면 그만큼 자연스럽게 늘어난다. */
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
});
