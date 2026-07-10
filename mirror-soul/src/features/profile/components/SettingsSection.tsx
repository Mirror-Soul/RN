import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProfileSection } from '../types';
import { SettingsItem } from './SettingsItem';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface SettingsSectionProps {
  section: ProfileSection;
  delay?: number;
}

export const SettingsSection = ({ section, delay = 200 }: SettingsSectionProps) => {
  const { colors } = useThemeColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.container}
    >
      <Text style={[styles.titleText, { color: colors.text.muted }]}>{section.title}</Text>
      
      <View style={[styles.cardContainer, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        {section.items.map((item, index) => (
          <SettingsItem 
            key={item.id} 
            item={item} 
            isLast={index === section.items.length - 1} 
          />
        ))}
      </View>
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
