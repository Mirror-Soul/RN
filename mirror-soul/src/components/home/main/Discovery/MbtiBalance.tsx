import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { Radii, Spacing } from '@/src/constants/theme';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import type { MbtiAxisScores } from '@/src/types/api/home';
import { MBTI_AXES } from './mbtiAxes';

const descriptions = {
  ieScore: ['에너지 방향', '내향', '외향'],
  nsScore: ['정보 이해', '직관', '감각'],
  ftScore: ['결정 방식', '감정', '사고'],
  pjScore: ['생활 방식', '인식', '판단'],
} as const;

export function MbtiBalance({ scores }: { scores: MbtiAxisScores }) {
  const { colors, palette } = useMatchingDesign();
  const { width, fontScale } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const twoColumns = (measuredWidth ?? Math.max(0, width - 64)) >= 272 && fontScale <= 1.3;
  const axes = MBTI_AXES.filter(([field]) => Number.isFinite(scores[field]));
  if (!axes.length) return null;
  return <View style={styles.grid} onLayout={event => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0) setMeasuredWidth(nextWidth);
  }}>
    {axes.map(([field, leftLetter, rightLetter]) => {
      const [title, leftName, rightName] = descriptions[field];
      const left = Math.round(Math.max(0, Math.min(100, scores[field])));
      const right = 100 - left;
      const balanced = left === right;
      const dominant = left > right
        ? { name: leftName, letter: leftLetter, percent: left, otherName: rightName, otherLetter: rightLetter, otherPercent: right, color: palette.accentInk }
        : { name: rightName, letter: rightLetter, percent: right, otherName: leftName, otherLetter: leftLetter, otherPercent: left, color: palette.cyanInk };
      return <View key={field} accessible
        accessibilityLabel={`${title}, ${balanced ? '균형, ' : ''}${leftName} ${leftLetter} ${left}%, ${rightName} ${rightLetter} ${right}%`}
        style={[styles.card, twoColumns ? styles.half : styles.full, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
        <Text style={[styles.title, { color: colors.text.secondary }]}>{title}</Text>
        <Text variant="heading" style={[styles.dominant, { color: balanced ? colors.text.primary : dominant.color }]}>
          {balanced ? '균형' : `${dominant.name} ${dominant.letter}`}
        </Text>
        <Text variant="heading" style={[styles.percent, balanced && styles.balancedPercent, { color: colors.text.primary }]}>
          {balanced ? '50% · 50%' : `${dominant.percent}%`}
        </Text>
        <Text style={[styles.secondary, { color: colors.text.secondary }]}>
          {balanced ? `${leftName} ${leftLetter} · ${rightName} ${rightLetter}` : `${dominant.otherName} ${dominant.otherLetter} · ${dominant.otherPercent}%`}
        </Text>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: { minWidth: 0, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.lg, gap: Spacing.xs },
  // Percentage widths alone would overflow once the column gap is added.
  half: { flexBasis: '46%', flexGrow: 1, maxWidth: '50%' },
  full: { width: '100%' },
  title: { fontSize: 13, lineHeight: 20 },
  dominant: { fontSize: 17, fontWeight: '600', lineHeight: 25 },
  percent: { fontSize: 26, fontWeight: '500', lineHeight: 34 },
  balancedPercent: { fontSize: 19, lineHeight: 34 },
  secondary: { fontSize: 13, lineHeight: 20, marginTop: Spacing.xxs },
});
