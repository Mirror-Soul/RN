import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * TwinSimulationCard 컴포넌트 (SRP)
 * 나를 학습한 트윈과의 영상통화(AI 콜) 진입 카드입니다.
 * 기존 "나를 알아가는 인터뷰" 미션이 쓰던 /ai-call 화면을 그대로 이어받습니다.
 *
 * 히어로 섹션과 "딥러닝 미션" 목록(EvolveBodyTitle) 사이에서 소속 없이 떠 있지 않도록,
 * 미션 섹션과 같은 형태의 eyebrow 라벨을 붙인다 — 카드 안의 "실시간 통화" 배지(실시간
 * 상태)와 겹치지 않게 다른 문구(카드 카테고리)를 쓴다. "실시간 통화" 배지는 미션 카드
 * 3종과 동일하게 우측 statusArea(화살표 위)에 둬서 우측 요소 위치를 통일했다.
 */
export default function TwinSimulationCard() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.eyebrow, { color: colors.text.muted }]}>실시간 연습</Text>

      <LinearGradient
        colors={[Colors.glass.cyan30_d3, Colors.glass.purple30, Colors.glass.pink30]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.background.card }]}
          onPress={() => router.push('/ai-call')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="트윈 시뮬레이션 시작"
        >
          <View style={styles.iconWrapper}>
            <Feather name="video" size={28} color={Colors.primary.electricCyan} />
          </View>

          <View style={styles.textArea}>
            <Text style={[styles.title, { color: colors.text.primary }]}>트윈 시뮬레이션</Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              나를 학습한 트윈과 영상통화로{'\n'}직접 대화하며 상태를 점검하세요.
            </Text>
          </View>

          <View style={styles.statusArea}>
            <View style={[styles.liveBadge, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={styles.liveBadgeText}>실시간 통화</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.muted} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  eyebrow: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 3.1,
  },
  borderGradient: {
    borderRadius: Radii.xxl,
    padding: 1,
    alignSelf: 'stretch',
  },
  card: {
    borderRadius: Radii.xxl,
    padding: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.cyan10_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.89,
  },
  statusArea: {
    alignItems: 'center',
    gap: 4,
  },
  liveBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  liveBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    color: Colors.primary.electricCyan,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    lineHeight: 16,
  },
});
