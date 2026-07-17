import React from 'react';
import {FontFamily, Colors} from '@/src/constants/theme';

import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TimeRefillOptionData } from '../constants/timeRefillOptions';
import { usePressAnimation } from '../hooks/useProfileAnimations';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface TimeRefillOptionProps {
  option: TimeRefillOptionData;
  delay?: number;
  onPress?: () => void;
}

export const TimeRefillOption = ({ option, delay = 0, onPress }: TimeRefillOptionProps) => {
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();
  const { colors } = useThemeColors();
  
  const isHighlighted = option.styleType === 'highlighted';

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={styles.containerMargin}
    >
      <Animated.View style={[animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
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
          
          <Text style={[styles.price, { color: colors.text.muted }, isHighlighted && styles.priceHighlighted]}>
            {option.price}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerMargin: {
    marginBottom: 12,
  },
  card: {
    width: '100%',
    height: 115,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.44,
  },
  textCyan: {
    color: 'rgba(0, 255, 255, 0.95)',
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 0.61,
  },
  badgePopular: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderColor: 'rgba(0, 255, 255, 0.25)',
  },
  badgeText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  badgeTextPopular: {
    color: 'rgba(0, 255, 255, 0.9)',
  },
  durationLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  price: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.31,
    marginTop: 12,
  },
  priceHighlighted: {
    color: 'rgba(0, 255, 255, 0.8)',
  },
});
