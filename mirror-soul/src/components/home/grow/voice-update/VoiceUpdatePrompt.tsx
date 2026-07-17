import VoiceUpdateIcon from '@/assets/images/common/evlove/voice-update/voice_update_icon.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface VoiceUpdatePromptProps {
  sentence: string;
}

/**
 * 목소리 업데이트 문장 안내 카드 (SRP)
 */
export default function VoiceUpdatePrompt({ sentence }: VoiceUpdatePromptProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: colors.text.primary }]}>다음 문장을 읽어주세요</Text>
        <Text style={[styles.subTitle, { color: colors.text.secondary }]}>자연스럽게, 평소 말하는 톤으로 읽어주시면 됩니다</Text>
      </View>

      <LinearGradient
        colors={[Colors.glass.pink20, Colors.glass.purple20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.body}
      >
        <View style={styles.bodyContainer}>
          <VoiceUpdateIcon width={24} height={24} />
          <Text style={[styles.sentenceText, { color: colors.text.primary }]}>{sentence}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.xxxl,
  },
  head: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  subTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  body: {
    height: 172,
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    borderColor: Colors.glass.pink30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    width: 280,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  sentenceText: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.regular,
    lineHeight: 29.25,
    letterSpacing: -0.439,
  },
});
