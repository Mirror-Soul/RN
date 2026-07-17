import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors, FontFamily } from '@/src/constants/theme';
import { usePressAnimation } from '../hooks/useProfileAnimations';

interface ProfileSettingsBannerProps {
  delay?: number;
}

export const ProfileSettingsBanner = ({
  delay = 360,
}: ProfileSettingsBannerProps) => {
  const router = useRouter();
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();

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
          style={styles.banner}
        >
          {/* 왼쪽: 아이콘 + 텍스트 */}
          <View style={styles.leftContent}>
            {/* 아이콘 컨테이너 */}
            <View style={styles.iconContainer}>
              <Feather
                name="user"
                size={24}
                color={Colors.primary.electricCyan}
              />
            </View>

            {/* 텍스트 */}
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>공간 관리 및 설정</Text>
              <Text style={styles.subtitleText}>시간 설정 및 계정 정보 관리</Text>
            </View>
          </View>

          {/* 오른쪽: chevron */}
          <Feather name="chevron-right" size={20} color={Colors.neutral.disabledText} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    borderRadius: 40,
    minHeight: 98,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.glass.white5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  titleText: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#FFFFFF',
  },
  subtitleText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.neutral.darkGray,
  },
});
