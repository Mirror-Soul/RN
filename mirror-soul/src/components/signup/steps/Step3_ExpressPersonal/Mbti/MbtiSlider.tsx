import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useMbtiSlider } from './hooks/useMbtiSlider';
import MbtiTrack from './parts/MbtiTrack';

interface Props {
  title: string;
  leftLabel: string; rightLabel: string;
  leftChar: string; rightChar: string;
  leftDescription: string; rightDescription: string;
  value: number;
  onChange: (value: number) => void;
  onDragStart?: () => void; onDragEnd?: () => void;
  showDetails: boolean;
  disabled: boolean;
}
export default function MbtiSlider({ title, leftLabel, rightLabel, leftChar, rightChar, leftDescription, rightDescription, value, onChange, onDragStart, onDragEnd, showDetails, disabled }: Props) {
  const { colors } = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const { panResponder, animValue, setSliderWidth, measureContainer } = useMbtiSlider({ value, onChange, onDragStart, onDragEnd });
  const options = [
    { char: leftChar, label: leftLabel, description: leftDescription, selected: value < 50, next: 25 },
    { char: rightChar, label: rightLabel, description: rightDescription, selected: value > 50, next: 75 },
  ];
  const current = value === 50 ? '가까운 쪽을 선택해주세요' : `${value < 50 ? leftLabel : rightLabel} 쪽에 더 가까워요`;
  return <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
    <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
    <View style={styles.choices}>{options.map(option => <Pressable key={option.char} accessibilityRole="radio" accessibilityLabel={`${title}, ${option.char}, ${option.description}`} accessibilityState={{ selected: option.selected, checked: option.selected, disabled }} disabled={disabled}
      onPress={() => { if (!option.selected) onChange(option.next); }} style={[styles.choice, fontScale > 1.3 && styles.stackedChoice, { backgroundColor: colors.background.glass, borderColor: option.selected ? colors.brand.accent : colors.border.primary, opacity: disabled ? 0.5 : 1 }]}>
      <View style={styles.choiceHeader}>
        <Text style={[styles.letter, { color: option.selected ? colors.brand.accent : colors.text.secondary }]}>{option.char}</Text>
        {option.selected && <Feather name="check" size={16} color={colors.brand.accent} />}
      </View>
      <Text style={[styles.description, { color: colors.text.primary }]}>{option.description}</Text>
    </Pressable>)}</View>
    {showDetails && <View pointerEvents={disabled ? 'none' : 'auto'} style={styles.details}>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{current}</Text>
      <View accessible accessibilityRole="adjustable" accessibilityLabel={`${title}, ${leftLabel}에서 ${rightLabel}`} accessibilityState={{ disabled }} accessibilityValue={{ min: 0, max: 100, now: value, text: current }}
        accessibilityActions={[{ name: 'increment', label: `${rightLabel} 쪽으로 조정` }, { name: 'decrement', label: `${leftLabel} 쪽으로 조정` }]}
        onAccessibilityAction={event => { if (!disabled) onChange(Math.max(0, Math.min(100, value + (event.nativeEvent.actionName === 'increment' ? 5 : -5)))); }}>
        <MbtiTrack panHandlers={panResponder.panHandlers} onLayout={setSliderWidth} measureContainer={measureContainer} animValue={animValue} />
      </View>
      <View style={styles.endLabels}><Text style={[styles.copy, { color: colors.text.secondary }]}>{leftLabel}</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>{rightLabel}</Text></View>
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg, gap: Spacing.md },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 24 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  choice: { flex: 1, flexBasis: 100, minWidth: 100, minHeight: 80, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, gap: Spacing.xs },
  stackedChoice: { flexBasis: '100%', minWidth: 0 },
  choiceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  letter: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24 },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  details: { gap: Spacing.xs },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  endLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
});
