import React from 'react';
import { FontFamily } from '@/src/constants/theme';

import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ProfileHeaderProps {
  name: string;
  email: string;
  delay?: number;
}

export const ProfileHeader = ({ name, email, delay = 0 }: ProfileHeaderProps) => {
  const { colors } = useThemeColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.container}
    >
      <View style={styles.avatarMargin}>
        <LinearGradient
          colors={['rgba(0, 211, 243, 0.2)', 'rgba(194, 122, 255, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarGradient}
        >
          <View style={[styles.avatarBorder, { borderColor: colors.border.primary }]}>
            <Feather name="user" size={32} color={colors.text.primary} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.nameText, { color: colors.text.primary }]}>안녕하세요, {name}님</Text>
        
        <View style={styles.emailContainer}>
          <Text style={[styles.emailText, { color: colors.text.muted }]}>{email}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
    width: '100%',
  },
  avatarMargin: {
    paddingBottom: 20,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.07,
    marginBottom: 6,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailText: {
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
