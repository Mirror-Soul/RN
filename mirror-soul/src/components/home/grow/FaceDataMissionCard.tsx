import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * FaceDataMissionCard 컴포넌트 (SRP)
 * 얼굴 데이터(표정) 학습 미션 진입 카드입니다. VoiceMissionCard/ValueBalanceMissionCard와
 * 동일한 와이드 카드 레이아웃으로 통일해 미션 리스트 전체의 UI 일관성을 유지합니다.
 */
export default function FaceDataMissionCard() {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={() => router.push('/face-data-update')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="얼굴 데이터 미션"
      accessibilityHint="표정 데이터를 촬영해 트윈을 학습시키는 화면으로 이동"
    >
      <View style={styles.left}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.background.card }]}>
          <Feather name="camera" size={28} color={Colors.primary.electricCyan} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>얼굴 데이터</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>표정과 감정 업데이트</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={[styles.statusText, { color: colors.text.muted }]}>Active Now</Text>
      </View>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.successGreen,
  },
  statusText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
