import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
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

  const bottomPadding = insets.bottom + paddingBottomOffset;
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
