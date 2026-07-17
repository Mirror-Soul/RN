import React from 'react';
import {FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  delay?: number;
}

export const Header = ({ 
  title, 
  showBackButton = true, 
  onBackPress, 
  rightElement,
  delay = 0 
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
      router.replace('/'); // Fallback if no history
    }
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={[styles.header, { paddingTop: insets.top + 16 }]}
    >
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

      <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
        {title}
      </Text>

      <View style={styles.emptySlot}>
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
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    letterSpacing: -0.44,
  },
  emptySlot: {
    width: 40,
    alignItems: 'flex-end',
  },
});
