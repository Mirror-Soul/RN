import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProfileSection } from '../types';
import { SettingsItem } from './SettingsItem';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

interface SettingsSectionProps {
  section: ProfileSection;
  delay?: number;
}

export const SettingsSection = ({ section, delay = 200 }: SettingsSectionProps) => {
  const { animatedTextMuted, animatedGlassBackground, animatedBorder } = useAnimatedTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.container}
    >
      <Animated.Text style={[styles.titleText, animatedTextMuted]}>{section.title}</Animated.Text>
      
      <Animated.View style={[styles.cardContainer, animatedGlassBackground, animatedBorder]}>
        {section.items.map((item, index) => (
          <SettingsItem 
            key={item.id} 
            item={item} 
            isLast={index === section.items.length - 1} 
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 24,
  },
  titleText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 12,
  },
  cardContainer: {
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
