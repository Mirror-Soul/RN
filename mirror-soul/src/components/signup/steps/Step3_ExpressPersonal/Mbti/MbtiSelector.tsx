import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import MbtiBadge from './MbtiBadge';
import MbtiSlider from './MbtiSlider';

export interface MbtiScores { ieScore: number; nsScore: number; ftScore: number; pjScore: number }
interface Props {
  onMbtiChange: (mbti: string) => void;
  onScoresChange?: (scores: MbtiScores) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}
export default function MbtiSelector({ onMbtiChange, onScoresChange, onDragStart, onDragEnd, disabled = false }: Props) {
  const { colors } = useThemeColors();
  const [ie, setIe] = useState(50);
  const [ns, setNs] = useState(50);
  const [ft, setFt] = useState(50);
  const [pj, setPj] = useState(50);
  const [showDetails, setShowDetails] = useState(false);
  const currentMbti = [ie === 50 ? '-' : ie < 50 ? 'I' : 'E', ns === 50 ? '-' : ns < 50 ? 'N' : 'S', ft === 50 ? '-' : ft < 50 ? 'F' : 'T', pj === 50 ? '-' : pj < 50 ? 'P' : 'J'].join('');
  const selected = [ie, ns, ft, pj].filter(value => value !== 50).length;
  useEffect(() => {
    onMbtiChange(currentMbti);
    // The API stores preference for the first letter of each axis (I/N/F/P).
    onScoresChange?.({ ieScore: 100 - ie, nsScore: 100 - ns, ftScore: 100 - ft, pjScore: 100 - pj });
  }, [currentMbti, ie, ns, ft, pj, onMbtiChange, onScoresChange]);
  const axes = [
    { title: '에너지를 얻는 방식', leftLabel: '내향', rightLabel: '외향', leftChar: 'I', rightChar: 'E', leftDescription: '혼자 쉬며 충전해요', rightDescription: '사람들과 만나며 충전해요', value: ie, onChange: setIe },
    { title: '새로운 것을 이해할 때', leftLabel: '직관', rightLabel: '감각', leftChar: 'N', rightChar: 'S', leftDescription: '가능성과 아이디어를 떠올려요', rightDescription: '직접 본 사실과 경험을 살펴요', value: ns, onChange: setNs },
    { title: '결정을 내릴 때', leftLabel: '감정', rightLabel: '사고', leftChar: 'F', rightChar: 'T', leftDescription: '사람의 마음과 관계를 먼저 봐요', rightDescription: '이유와 기준을 먼저 봐요', value: ft, onChange: setFt },
    { title: '하루를 보내는 방식', leftLabel: '유연', rightLabel: '계획', leftChar: 'P', rightChar: 'J', leftDescription: '상황에 맞춰 유연하게 움직여요', rightDescription: '미리 계획하고 차근차근해요', value: pj, onChange: setPj },
  ];
  return <View style={styles.container}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>나와 가까운 성향</Text>
      <MbtiBadge mbti={currentMbti} />
    </View>
    <Text style={[styles.copy, { color: colors.text.secondary }]}>MBTI를 몰라도 괜찮아요. 평소 내 모습에 더 가까운 쪽을 골라주세요.</Text>
    <View style={styles.toolbar}>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{selected} / 4 선택</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="성향 세부 조정" accessibilityState={{ expanded: showDetails, disabled }} disabled={disabled} onPress={() => { if (showDetails) onDragEnd?.(); setShowDetails(value => !value); }} style={styles.toggle}>
        <Text style={[styles.copy, { color: colors.brand.accent }]}>세부 조정</Text>
        <Feather name={showDetails ? 'chevron-up' : 'chevron-down'} size={16} color={colors.brand.accent} />
      </Pressable>
    </View>
    {axes.map(axis => <MbtiSlider key={axis.leftChar} {...axis} showDetails={showDetails} disabled={disabled} onDragStart={onDragStart} onDragEnd={onDragEnd} />)}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 28 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  toggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
