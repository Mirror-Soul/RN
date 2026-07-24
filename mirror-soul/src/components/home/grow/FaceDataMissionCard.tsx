import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * FaceDataMissionCard 컴포넌트 (SRP)
 * 얼굴 데이터(표정/감정) 학습 미션 진입 카드입니다.
 * TODO: 실제 "일일 얼굴 스캔" 화면 라우트가 아직 없어 임시 안내로 대체.
 * 라우트가 준비되면 router.push로 교체.
 */
export default function FaceDataMissionCard() {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={() => Alert.alert('안내', '얼굴 데이터 학습 기능은 곧 제공될 예정입니다.')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="얼굴 데이터 미션"
    >
      <View style={styles.iconWrapper}>
        <Feather name="camera" size={24} color={Colors.primary.electricCyan} />
      </View>

      <View>
        <Text style={[styles.title, { color: colors.text.primary }]}>얼굴 데이터</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>표정과 감정 업데이트</Text>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, { color: colors.text.muted }]}>Active Now</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: Colors.glass.cyan10_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
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
