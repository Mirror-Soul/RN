import VoiceIcon from '@/assets/images/common/evlove/evlove_voice.svg';
import TimerIcon from '@/assets/images/common/evlove/evlove_timer.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 목소리 녹음 카드 (SRP)
 */
export default function EvolveVoiceCard() {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel="목소리 녹음 미션"
      accessibilityHint="내 말투를 학습시키기 위한 목소리 녹음 화면으로 이동"
    >
      <LinearGradient
        colors={[Colors.glass.pink20, Colors.glass.red20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <VoiceIcon width={16} height={16} />
          </View>
          <Text style={styles.dateText}>2일 전</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>목소리 녹음</Text>
          <Text style={styles.subTitle}>내 말투 학습시키기</Text>
        </View>

        <View style={styles.footer}>
          <TimerIcon width={16} height={16} />
          <Text style={styles.timeText}>5분</Text>
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
    borderColor: Colors.glass.pink30,
    gap: 10,
    height: 123,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: Radii.smmd,
    backgroundColor: Colors.glass.pink30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: Colors.neutral.darkGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  content: {
    gap: 2,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  subTitle: {
    color: Colors.neutral.lightGray,
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
    color: Colors.neutral.darkGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
