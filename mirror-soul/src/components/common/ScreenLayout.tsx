import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  paddingBottomOffset?: number;
}

export const ScreenLayout = ({ 
  children, 
  withScroll = true, 
  style, 
  contentContainerStyle,
  paddingBottomOffset = 40 
}: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  const bottomPadding = insets.bottom + paddingBottomOffset;

  if (withScroll) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }, style]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary, paddingBottom: bottomPadding }, style]}>
      {children}
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
});
