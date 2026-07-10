import FaceScanIcon from '@/assets/images/common/evlove/evolve_facescan.svg';
import TimerIcon from '@/assets/images/common/evlove/evlove_timer.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 얼굴 스캔 카드 (SRP)
 */
export default function EvolveFaceScanCard() {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel="얼굴 스캔 미션"
      accessibilityHint="표정과 감정을 학습시키기 위한 얼굴 스캔 화면으로 이동"
    >
      <LinearGradient
        colors={[Colors.glass.cyan20, Colors.glass.blue20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <FaceScanIcon width={16} height={16} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text.primary }]}>얼굴 스캔</Text>
          <Text style={[styles.subTitle, { color: colors.text.secondary }]}>표정과 감정 학습</Text>
        </View>

        <View style={styles.footer}>
          <TimerIcon width={16} height={16} />
          <Text style={[styles.timeText, { color: colors.text.secondary }]}>2분</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan30,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: Radii.smmd,
    backgroundColor: Colors.glass.cyan30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: 2,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  subTitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
