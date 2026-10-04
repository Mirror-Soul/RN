import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { Spacing } from '@/src/constants/theme';
import { FloatingTabBarInsetContext } from './FloatingTabBarInsetContext';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** 안전 영역 위의 최소 여백. 메인 탭에서는 실측 메뉴 높이도 함께 반영한다. */
  paddingBottomOffset?: number;
  /** 히어로 배경처럼 화면 끝까지 닿아야 하는 화면은 false로 캡을 끌 것. 기본은 켜짐. */
  centerContent?: boolean;
}

export const ScreenLayout = ({
  children,
  withScroll = true,
  style,
  contentContainerStyle,
  paddingBottomOffset = 40,
  centerContent = true,
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { contentContainerStyle: responsiveStyle } = useLayout();
  const tabBarInset = useContext(FloatingTabBarInsetContext);

  // 기존 화면의 더 넓은 여백은 유지하며, 실측 탭바 높이를 최소 여백으로 보장한다.
  // tabBarInset은 이미 안전 영역을 포함하므로 insets.bottom을 중복해서 더하지 않는다.
  const bottomPadding = Math.max(insets.bottom + paddingBottomOffset, tabBarInset > 0 ? tabBarInset + Spacing.lg : 0);
  const contentWrapperStyle = centerContent ? responsiveStyle : undefined;

  if (withScroll) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }, style]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }, contentContainerStyle]}
        >
          <View style={contentWrapperStyle}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary, paddingBottom: bottomPadding }, style]}>
      <View style={[styles.flexFill, contentWrapperStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flexFill: {
    flex: 1,
  },
});
