import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * VoiceMissionCard 컴포넌트 (SRP)
 * 목소리 정밀 학습 미션 진입 카드입니다. 기존 EvolveVoiceCard의 /voice-update
 * 라우팅을 그대로 유지하고 새 디자인(전체 폭 와이드 카드)으로 리디자인했습니다.
 */
export default function VoiceMissionCard() {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={() => router.push('/voice-update')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="목소리 정밀 학습 미션"
      accessibilityHint="내 말투를 학습시키기 위한 목소리 녹음 화면으로 이동"
    >
      <View style={styles.left}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.background.card }]}>
          <Feather name="mic" size={28} color={colors.text.secondary} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>목소리 정밀 학습</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>고유의 말투와 문장 어조 시뮬레이션</Text>
        </View>
      </View>

      <Text style={[styles.dateText, { color: colors.text.muted }]}>2일 전</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignSelf: 'stretch',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  dateText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
  },
});
