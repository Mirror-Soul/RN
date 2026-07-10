import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface UserProfileCardProps {
  similarityPercent?: number;
  growthMessage?: string;
}

/**
 * UserProfileCard 컴포넌트 (SRP)
 * 프로필 아바타(현재 비움), 트윈 유사도 %, 성장 안내 문구를 렌더링합니다.
 * 프로필 이미지는 API 연동 후 채울 예정입니다.
 */
export default function UserProfileCard({
  similarityPercent = 73,
  growthMessage = '더 나은 매칭을 위해 성장하세요',
}: UserProfileCardProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <View style={styles.inner}>
        {/* Avatar (빈 상태 — 추후 API 연동) */}
        <LinearGradient
          colors={['rgba(0,211,243,0.20)', 'rgba(194,122,255,0.20)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, { borderColor: colors.border.primary }]}
        />

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.labelText, { color: colors.text.secondary }]}>트윈 유사도</Text>
            <Text style={styles.percentText}>{similarityPercent}%</Text>
          </View>
          <Text style={[styles.growthText, { color: colors.text.muted }]}>{growthMessage}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    paddingHorizontal: 12,
    height: 70,
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    borderWidth: 0.612,
  },
  info: {
    flexDirection: 'column',
    gap: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
  },
  labelText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  percentText: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  growthText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
