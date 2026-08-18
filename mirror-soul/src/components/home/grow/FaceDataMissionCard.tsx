import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * FaceDataMissionCard 컴포넌트 (SRP)
 * 얼굴 데이터(표정) 학습 미션 진입 카드입니다. VoiceMissionCard/ValueBalanceMissionCard와
 * 동일한 와이드 카드 레이아웃 + 아이콘 틴트 패턴으로 통일해 미션 리스트 전체의 UI 일관성을
 * 유지합니다.
 *
 * 이 미션엔 대응하는 백엔드 엔드포인트가 아직 없어 실제 진행 데이터를 보여줄 수 없고,
 * "필수"처럼 없는 상태를 지어내지 않기 위해 우측엔 단순 이동 안내 화살표만 둔다.
 */
export default function FaceDataMissionCard() {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
      onPress={() => router.push('/face-data-update')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="얼굴 데이터 미션"
      accessibilityHint="표정 데이터를 촬영해 트윈을 학습시키는 화면으로 이동"
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <Feather name="camera" size={28} color={Colors.primary.electricCyan} />
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>얼굴 데이터</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>표정과 감정 업데이트</Text>
        </View>
      </View>

      <Feather name="chevron-right" size={20} color={colors.text.muted} />
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
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.cyan20,
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
});
