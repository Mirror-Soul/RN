import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from '../hooks/useProfileAnimations';
import { ProfileItem } from '../types';

/** item.id → expo-router 경로 매핑 */
const ITEM_ROUTES: Partial<Record<string, string>> = {
  voice_audio: '/(main)/voice-audio',
};

interface SettingsItemProps {
  item: ProfileItem;
  isLast?: boolean;
}

export const SettingsItem = ({ item, isLast = false }: SettingsItemProps) => {
  const router = useRouter();
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();

  const handlePress = () => {
    const route = ITEM_ROUTES[item.id];
    if (route) router.push(route as any);
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, !isLast && styles.borderBottom]}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.iconBgColor }]}>
          <Feather name={item.iconName} size={16} color={item.iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.label}>{item.label}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
        </View>

        <Feather name="chevron-right" size={16} color="#4A5565" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 0.61,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#FFFFFF',
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    marginTop: 2,
  },
});
