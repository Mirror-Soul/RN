import TimerIcon from '@/assets/images/common/evlove/evlove_timer.svg';
import VoiceIcon from '@/assets/images/common/evlove/evlove_voice.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import useAnimatedTheme from '@/src/hooks/useAnimatedTheme';


/**
 * 목소리 녹음 카드 (SRP)
 */
export default function EvolveVoiceCard() {
  const router = useRouter();
  const { animatedText, animatedTextSecondary } = useAnimatedTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel="목소리 녹음 미션"
      accessibilityHint="내 말투를 학습시키기 위한 목소리 녹음 화면으로 이동"
      onPress={() => router.push('/voice-update')}
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
          <Animated.Text style={[styles.dateText, animatedTextSecondary]}>2일 전</Animated.Text>
        </View>

        <View style={styles.content}>
          <Animated.Text style={[styles.title, animatedText]}>목소리 녹음</Animated.Text>
          <Animated.Text style={[styles.subTitle, animatedTextSecondary]}>내 말투 학습시키기</Animated.Text>
        </View>

        <View style={styles.footer}>
          <TimerIcon width={16} height={16} />
          <Animated.Text style={[styles.timeText, animatedTextSecondary]}>5분</Animated.Text>
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
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
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
