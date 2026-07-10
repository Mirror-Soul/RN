import VoiceUpdateIcon from '@/assets/images/common/evlove/voice-update/voice_update_icon.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import useAnimatedTheme from '@/src/hooks/useAnimatedTheme';

interface VoiceUpdatePromptProps {
  sentence: string;
}

/**
 * 목소리 업데이트 문장 안내 카드 (SRP)
 */
export default function VoiceUpdatePrompt({ sentence }: VoiceUpdatePromptProps) {
  const { animatedText, animatedTextSecondary } = useAnimatedTheme();

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Animated.Text style={[styles.title, animatedText]}>다음 문장을 읽어주세요</Animated.Text>
        <Animated.Text style={[styles.subTitle, animatedTextSecondary]}>자연스럽게, 평소 말하는 톤으로 읽어주시면 됩니다</Animated.Text>
      </View>

      <LinearGradient
        colors={[Colors.glass.pink20, Colors.glass.purple20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.body}
      >
        <View style={styles.bodyContainer}>
          <VoiceUpdateIcon width={24} height={24} />
          <Animated.Text style={[styles.sentenceText, animatedText]}>{sentence}</Animated.Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: 32,
  },
  head: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  subTitle: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  body: {
    height: 172,
    borderRadius: 24,
    borderWidth: 0.612,
    borderColor: Colors.glass.pink30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    width: 280,
    alignItems: 'center',
    gap: 16,
  },
  sentenceText: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 29.25,
    letterSpacing: -0.439,
  },
});
