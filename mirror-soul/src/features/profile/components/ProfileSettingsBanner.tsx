import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { usePressAnimation } from '../hooks/useProfileAnimations';

interface ProfileSettingsBannerProps {
  delay?: number;
}

export const ProfileSettingsBanner = ({
  delay = 360,
}: ProfileSettingsBannerProps) => {
  const router = useRouter();
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();
  const { colors } = useThemeColors();

  const handlePress = () => {
    router.push('/(main)/profile-settings');
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(550).springify()}
      style={[styles.wrapper, animatedStyle]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[
            'rgba(0, 211, 243, 0.1)',
            'rgba(173, 70, 255, 0.1)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.banner, { borderColor: colors.border.primary }]}
        >
          {/* 왼쪽: 아이콘 + 텍스트 */}
          <View style={styles.leftContent}>
            {/* 아이콘 컨테이너 */}
            <View style={[styles.iconContainer, { backgroundColor: colors.background.glass }]}>
              <Feather
                name="user"
                size={24}
                color={Colors.primary.electricCyan}
              />
            </View>

            {/* 텍스트 */}
            <View style={styles.textContainer}>
              <Text style={[styles.titleText, { color: colors.text.primary }]}>공간 관리 및 설정</Text>
              <Text style={[styles.subtitleText, { color: colors.text.secondary }]}>시간 설정 및 계정 정보 관리</Text>
            </View>
          </View>

          {/* 오른쪽: chevron */}
          <Feather name="chevron-right" size={20} color={colors.text.muted} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xxl,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xxl,
    borderWidth: 1,
    borderRadius: 40,
    minHeight: 98,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xxs,
  },
  titleText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  subtitleText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
});
