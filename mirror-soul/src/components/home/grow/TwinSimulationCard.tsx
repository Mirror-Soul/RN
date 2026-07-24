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
 */
export default function TwinSimulationCard() {
  const { colors } = useThemeColors();

  return (
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
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text.primary }]}>트윈 시뮬레이션</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Live Call</Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>
            나를 학습한 트윈과 영상통화로{'\n'}직접 대화하며 상태를 점검하세요.
          </Text>
        </View>

        <Feather name="chevron-right" size={20} color={colors.text.muted} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.89,
  },
  liveBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.sm,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  liveBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black,
    textTransform: 'uppercase',
    color: Colors.primary.electricCyan,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    lineHeight: 16,
  },
});
