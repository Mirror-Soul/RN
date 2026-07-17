import React from 'react';
import { Colors } from '@/src/constants/theme';

import {
  View,
  StyleSheet,
  ImageBackground,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ProfileHeroSectionProps {
  avatarUrl?: string;
  isOwnProfile: boolean;
  onSettingsPress?: () => void;
}

export const ProfileHeroSection = ({
  avatarUrl,
  isOwnProfile,
  onSettingsPress,
}: ProfileHeroSectionProps) => {
  const { height } = useWindowDimensions();
  const heroHeight = height * 0.45;
  const { colors, isDark } = useThemeColors();

  const fadeGradient: readonly [string, string, string] = isDark 
    ? ['rgba(0, 0, 0, 0)', 'rgba(20, 20, 20, 0.15)', colors.background.primary]
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.15)', colors.background.primary];

  const content = (
    <>
      {/* Layer 1: 상단 어두운 오버레이 (top → transparent) */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Layer 2: 시안 Radial Glow (중앙, opacity 0.4) */}
      <View
        style={[StyleSheet.absoluteFill, styles.cyanGlow]}
        pointerEvents="none"
      />

      {/* Layer 3: 하단 페이드아웃 (transparent → background) */}
      <LinearGradient
        colors={fadeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.bottomFade]}
        pointerEvents="none"
      />

      {/* 우측 상단 설정 버튼 (내 프로필일 때만) */}
      {isOwnProfile && (
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={styles.settingsBtnWrapper}
        >
          <Pressable
            onPress={onSettingsPress}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="프로필 설정 열기"
          >
            <Feather name="settings" size={20} color={colors.text.primary} />
          </Pressable>
        </Animated.View>
      )}
    </>
  );

  if (avatarUrl) {
    return (
      <ImageBackground
        source={{ uri: avatarUrl }}
        style={[styles.hero, { height: heroHeight }]}
        resizeMode="cover"
      >
        {content}
      </ImageBackground>
    );
  }

  // 폴백: 그라디언트 배경 (Option A)
  return (
    <View style={[styles.hero, { height: heroHeight, backgroundColor: colors.background.primary }]}>
      {/* 기본 배경 그라디언트 */}
      <LinearGradient
        colors={[
          'rgba(0, 211, 243, 0.12)',
          'rgba(20, 20, 20, 1)',
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* 보조 퍼플 글로우 */}
      <LinearGradient
        colors={[
          'rgba(194, 122, 255, 0.08)',
          'rgba(0, 0, 0, 0)',
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    overflow: 'hidden',
  },
  cyanGlow: {
    opacity: 0.4,
    // React Native에서는 radial gradient를 직접 지원하지 않으므로
    // 중앙에 시안색 원형 glow를 shadow로 근사
    shadowColor: '#00D3F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 80,
    elevation: 0,
  },
  bottomFade: {
    // 하단 1/3 부분에만 적용하기 위해 top 오프셋 사용
    top: '55%',
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  settingsBtnWrapper: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
