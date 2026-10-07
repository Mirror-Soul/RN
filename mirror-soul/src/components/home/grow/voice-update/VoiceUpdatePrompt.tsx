import { Feather } from '@expo/vector-icons';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { MIN_READING_SIMILARITY } from './readingSimilarity';

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
        <Text style={[styles.title, { color: colors.text.primary }]}>평소 말하듯 읽어주세요</Text>
        <Text style={[styles.subTitle, { color: colors.text.secondary }]}>조용한 곳에서 끝까지 읽어주세요. 문장이 {Math.round(MIN_READING_SIMILARITY * 100)}% 이상 일치하면 녹음을 보내요.</Text>
      </View>

      <LinearGradient
        colors={[Colors.glass.pink20, Colors.glass.purple20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.body}
      >
        <View style={styles.bodyContainer}>
          <View style={styles.labelRow}><Feather name="mic" size={16} color={Colors.primary.vividPink} /><Text style={[styles.label, { color: colors.text.secondary }]}>읽을 문장</Text></View>
          <Text style={[styles.sentenceText, { color: colors.text.primary }]}>{sentence}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: 12,
  },
  head: {
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  title: {
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  subTitle: {
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: 13,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  body: {
    padding: 16,
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    borderColor: Colors.glass.pink30,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  bodyContainer: {
    width: '100%',
    alignItems: 'stretch',
    gap: 8,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flexShrink: 1, fontSize: 12, lineHeight: 20 },
  sentenceText: {
    alignSelf: 'stretch',
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: 21,
    fontWeight: FontWeight.medium,
    lineHeight: 33,
    letterSpacing: 0,
  },
});
