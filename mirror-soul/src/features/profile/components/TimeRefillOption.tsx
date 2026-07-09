import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TimeRefillOptionData } from '../constants/timeRefillOptions';
import { usePressAnimation } from '../hooks/useProfileAnimations';

interface TimeRefillOptionProps {
  option: TimeRefillOptionData;
  delay?: number;
  onPress?: () => void;
}

export const TimeRefillOption = ({ option, delay = 0, onPress }: TimeRefillOptionProps) => {
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();
  
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
            isHighlighted ? styles.cardHighlighted : styles.cardDefault
          ]}
        >
          <View style={styles.topRow}>
            <Text style={[styles.addedTime, isHighlighted && styles.textCyan]}>
              {option.addedTime}
            </Text>
            
            {option.badge && (
              <View style={[
                styles.badge, 
                option.badge.type === 'popular' ? styles.badgePopular : styles.badgeBest
              ]}>
                <Text style={[
                  styles.badgeText, 
                  option.badge.type === 'popular' ? styles.badgeTextPopular : styles.badgeTextBest
                ]}>
                  {option.badge.icon ? `${option.badge.icon} ` : ''}{option.badge.text}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.durationLabel}>{option.durationLabel}</Text>
          
          <Text style={[styles.price, isHighlighted && styles.priceHighlighted]}>
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
  cardDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.44,
    color: 'rgba(255, 255, 255, 0.9)',
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
  badgeBest: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  badgeTextPopular: {
    color: 'rgba(0, 255, 255, 0.9)',
  },
  badgeTextBest: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  durationLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    marginTop: 2,
  },
  price: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.31,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
  },
  priceHighlighted: {
    color: 'rgba(0, 255, 255, 0.8)',
  },
});
