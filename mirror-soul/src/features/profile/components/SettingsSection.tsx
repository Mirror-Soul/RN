import React from 'react';
import { useRouter } from 'expo-router';
import { SectionHeading } from '@/src/components/common/SectionHeading';
import { FontFamily } from '@/src/constants/theme';

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
      <SectionHeading title={section.title} style={styles.sectionLabelSpacing} />
      
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
    width: '100%',
    marginBottom: 24,
  },
  sectionLabelSpacing: {
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  cardContainer: {
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
