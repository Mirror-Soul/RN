import {Colors, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MbtiBadge from './MbtiBadge';
import MbtiSlider from './MbtiSlider';

export interface MbtiScores {
  ieScore: number;
  nsScore: number;
  ftScore: number;
  pjScore: number;
}

interface Props {
  onMbtiChange: (mbti: string) => void;
  onScoresChange?: (scores: MbtiScores) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function MbtiSelector({ onMbtiChange, onScoresChange, onDragStart, onDragEnd }: Props) {
  const [ie, setIe] = useState(50);
  const [ns, setNs] = useState(50); // sn -> ns
  const [ft, setFt] = useState(50); // tf -> ft
  const [pj, setPj] = useState(50);

  const calculateMbti = () => {
    let result = '';
    // Slider value: 0 (Left) ~ 100 (Right)
    // Left char score = 100 - value
    result += ie === 50 ? '-' : (ie < 50 ? 'I' : 'E');
    result += ns === 50 ? '-' : (ns < 50 ? 'N' : 'S');
    result += ft === 50 ? '-' : (ft < 50 ? 'F' : 'T');
    result += pj === 50 ? '-' : (pj < 50 ? 'P' : 'J');
    return result;
  };

  const currentMbti = calculateMbti();

  useEffect(() => {
    onMbtiChange(currentMbti);
    if (onScoresChange) {
      onScoresChange({
        ieScore: 100 - ie,
        nsScore: 100 - ns,
        ftScore: 100 - ft,
        pjScore: 100 - pj,
      });
    }
  }, [currentMbti, ie, ns, ft, pj]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>MBTI 검사 유형</Text>
        <MbtiBadge mbti={currentMbti} />
      </View>

      <View style={styles.slidersContainer}>
        <MbtiSlider
          leftLabel="내향적" rightLabel="외향적"
          leftChar="I" rightChar="E"
          value={ie} onChange={setIe}
          onDragStart={onDragStart} onDragEnd={onDragEnd}
        />
        <MbtiSlider
          leftLabel="직관적" rightLabel="감각적"
          leftChar="N" rightChar="S"
          value={ns} onChange={setNs}
          onDragStart={onDragStart} onDragEnd={onDragEnd}
        />
        <MbtiSlider
          leftLabel="감정적" rightLabel="사고적"
          leftChar="F" rightChar="T"
          value={ft} onChange={setFt}
          onDragStart={onDragStart} onDragEnd={onDragEnd}
        />
        <MbtiSlider
          leftLabel="인식적" rightLabel="판단적"
          leftChar="P" rightChar="J"
          value={pj} onChange={setPj}
          onDragStart={onDragStart} onDragEnd={onDragEnd}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  slidersContainer: {
    width: '100%',
    gap: Spacing.xxl,
  }
});
