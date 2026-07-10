import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from '../hooks/useProfileAnimations';
import { ProfileItem } from '../types';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const ITEM_ROUTES: Partial<Record<string, string>> = {
  account_management: '/(main)/account',
  voice_audio: '/(main)/voice-audio',
  notifications: '/(main)/notification',
  customer_center: '/(main)/customer-center',
  terms_policies: '/(main)/terms-policy',
};

interface SettingsItemProps {
  item: ProfileItem;
  isLast?: boolean;
}


export const SettingsItem = ({ item, isLast = false }: SettingsItemProps) => {
  const router = useRouter();
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();
  const { colors } = useThemeColors();

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
        style={[styles.container, !isLast && styles.borderBottom, !isLast && { borderColor: colors.border.primary }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.iconBgColor }]}>
          <Feather name={item.iconName} size={16} color={item.iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.text.primary }]}>{item.label}</Text>
          {item.description && (
            <Text style={[styles.description, { color: colors.text.muted }]}>{item.description}</Text>
          )}
        </View>

        <Feather name="chevron-right" size={16} color={colors.text.muted} />
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
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
