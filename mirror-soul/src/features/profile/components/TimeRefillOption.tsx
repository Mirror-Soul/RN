import React from 'react';
import {FontFamily, Colors, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

import { ActivityIndicator, View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TimeRefillOptionData } from '../constants/timeRefillOptions';
import { usePressAnimation } from '../hooks/useProfileAnimations';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface TimeRefillOptionProps {
  option: TimeRefillOptionData;
  delay?: number;
  onPress?: () => void;
  /** 이 옵션이 구매 진행 중인지 여부 — true면 가격 자리에 스피너를 보여준다. */
  isLoading?: boolean;
  /** 다른 옵션이 구매 진행 중이라 이 옵션을 비활성화해야 하는지 여부. */
  disabled?: boolean;
}

export const TimeRefillOption = ({ option, delay = 0, onPress, isLoading = false, disabled = false }: TimeRefillOptionProps) => {
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();
  const { colors } = useThemeColors();

  const isHighlighted = option.styleType === 'highlighted';
  const isDisabled = disabled || isLoading;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={styles.containerMargin}
    >
      <Animated.View style={[animatedStyle, isDisabled && styles.disabled]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          accessibilityState={{ disabled: isDisabled, busy: isLoading }}
          style={[
            styles.card,
            isHighlighted ? styles.cardHighlighted : { backgroundColor: colors.background.glass, borderColor: colors.border.primary }
          ]}
        >
          <View style={styles.topRow}>
            <Text style={[styles.addedTime, { color: colors.text.primary }, isHighlighted && styles.textCyan]}>
              {option.addedTime}
            </Text>

            {option.badge && (
              <View style={[
                styles.badge,
                option.badge.type === 'popular' ? styles.badgePopular : { backgroundColor: colors.background.glass, borderColor: colors.border.primary }
              ]}>
                <Text style={[
                  styles.badgeText,
                  option.badge.type === 'popular' ? styles.badgeTextPopular : { color: colors.text.muted }
                ]}>
                  {option.badge.icon ? `${option.badge.icon} ` : ''}{option.badge.text}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.durationLabel, { color: colors.text.secondary }]}>{option.durationLabel}</Text>

          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary.electricCyan} style={styles.priceSpinner} />
          ) : (
            <Text style={[styles.price, { color: colors.text.muted }, isHighlighted && styles.priceHighlighted]}>
              {option.price}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerMargin: {
    marginBottom: Spacing.md,
  },
  card: {
    width: '100%',
    height: 115,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 0.61,
  },
  cardHighlighted: {
    backgroundColor: 'rgba(0, 255, 255, 0.06)',
    borderColor: 'rgba(0, 255, 255, 0.35)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addedTime: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    lineHeight: 28,
    letterSpacing: -0.44,
  },
  textCyan: {
    color: 'rgba(0, 255, 255, 0.95)',
  },
  badge: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg2,
    borderWidth: 0.61,
  },
  badgePopular: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderColor: 'rgba(0, 255, 255, 0.25)',
  },
  badgeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
  badgeTextPopular: {
    color: 'rgba(0, 255, 255, 0.9)',
  },
  durationLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
    lineHeight: 16,
    marginTop: Spacing.xxs,
  },
  price: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.lg,
    lineHeight: 24,
    letterSpacing: -0.31,
    marginTop: Spacing.md,
  },
  priceHighlighted: {
    color: 'rgba(0, 255, 255, 0.8)',
  },
  priceSpinner: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
});
