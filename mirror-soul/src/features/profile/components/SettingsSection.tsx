import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProfileSection } from '../types';
import { SettingsItem } from './SettingsItem';

interface SettingsSectionProps {
  section: ProfileSection;
  delay?: number;
}

export const SettingsSection = ({ section, delay = 200 }: SettingsSectionProps) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.container}
    >
      <Text style={styles.titleText}>{section.title}</Text>
      
      <View style={styles.cardContainer}>
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
    color: '#6A7282',
    marginLeft: 4,
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
});
