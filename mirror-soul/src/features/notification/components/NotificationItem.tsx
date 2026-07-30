import React from 'react';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedSwitch } from '@/src/components/common/AnimatedSwitch';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

interface NotificationItemProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
  disabled?: boolean;
}

export const NotificationItem = ({
  title,
  description,
  value,
  onToggle,
  isLast = false,
  disabled = false,
}: NotificationItemProps) => {
  const { animatedText, animatedTextMuted, animatedBorder } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, !isLast && styles.borderBottom, !isLast && animatedBorder, disabled && styles.disabled]}>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.title, animatedText]}>{title}</Animated.Text>
        <Animated.Text style={[styles.description, animatedTextMuted]}>{description}</Animated.Text>
      </View>

      <AnimatedSwitch value={value} onToggle={onToggle} disabled={disabled} accessibilityLabel={title} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  borderBottom: {
    borderBottomWidth: 0.61,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xxs,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  description: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.xxs,
  },
  disabled: {
    opacity: 0.5,
  },
});
