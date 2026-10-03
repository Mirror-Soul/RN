import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function InterviewAIBox({ question }: { question: string }) {
  const { colors } = useThemeColors();
  const [showHelp, setShowHelp] = useState(false);
  return (
    <View style={[styles.card, { borderColor: colors.border.primary, backgroundColor: colors.background.card }]}>
      <Text style={[styles.label, { color: colors.brand.accent }]}>이번에 나눌 이야기</Text>
      <Text style={[styles.question, { color: colors.text.primary }]}>{question}</Text>
      <Text style={[styles.hint, { color: colors.text.secondary }]}>어떤 상황이었는지, 어떻게 행동했고 왜 그랬는지 들려주세요.</Text>
      <Pressable onPress={() => setShowHelp(value => !value)} accessibilityRole="button" accessibilityState={{ expanded: showHelp }} style={styles.helpButton}>
        <Feather name={showHelp ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text.secondary} />
        <Text style={[styles.helpLabel, { color: colors.text.secondary }]}>말문이 막힌다면</Text>
      </Pressable>
      {showHelp && <View style={[styles.help, { backgroundColor: colors.background.glass }]}>
        <Text style={[styles.hint, { color: colors.text.secondary }]}>
          떠오르는 경험 한 가지만 이야기해도 좋아요. 비슷한 경험이 없다면 내가 어떻게 할 것 같은지, 그 이유를 말해주세요.
        </Text>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', padding: Spacing.xl, borderWidth: 1, borderRadius: Radii.lg2, gap: Spacing.md },
  label: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  question: { fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 28, letterSpacing: -0.3 },
  hint: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  helpButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  helpLabel: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, flexShrink: 1 },
  help: { padding: Spacing.md, borderRadius: Radii.md },
});
