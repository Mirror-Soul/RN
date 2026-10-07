import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { Spacing } from '@/src/constants/theme';
import { FloatingTabBarInsetContext } from './FloatingTabBarInsetContext';
import { useMainTabScroll } from '@/src/hooks/useMainTabScroll';
import { useMainTabBottomPadding } from '@/src/hooks/useMainTabBottomPadding';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** 안전 영역 위의 최소 여백. 메인 탭에서는 실측 메뉴 높이도 함께 반영한다. */
  paddingBottomOffset?: number;
  /** 히어로 배경처럼 화면 끝까지 닿아야 하는 화면은 false로 캡을 끌 것. 기본은 켜짐. */
  centerContent?: boolean;
  /** Primary tab scroll only; settings/editor scrolls do not hide navigation. */
  mainTabScrollRoute?: string;
}

export const ScreenLayout = ({
  children,
  withScroll = true,
  style,
  contentContainerStyle,
  paddingBottomOffset = 40,
  centerContent = true,
  mainTabScrollRoute,
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { contentContainerStyle: responsiveStyle } = useLayout();
  const tabBarInset = useContext(FloatingTabBarInsetContext);
  const mainTabPadding = useMainTabBottomPadding();
  const scrollCallbacks = useMainTabScroll(mainTabScrollRoute ?? '', !!mainTabScrollRoute);

  // Primary tabs share the measured reserve; settings keep their requested larger padding.
  // tabBarInset already includes the safe area, so never add it a second time.
  const bottomPadding = mainTabScrollRoute ? mainTabPadding : Math.max(insets.bottom + paddingBottomOffset, tabBarInset > 0 ? tabBarInset + Spacing.lg : 0);
  const contentWrapperStyle = centerContent ? responsiveStyle : undefined;

  if (withScroll) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }, style]}>
        <ScrollView
          {...(mainTabScrollRoute ? scrollCallbacks : {})}
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
