import { Colors } from '@/src/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MbtiBadge from './MbtiBadge';
import MbtiSlider from './MbtiSlider';

interface Props {
  onMbtiChange: (mbti: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function MbtiSelector({ onMbtiChange, onDragStart, onDragEnd }: Props) {
  const [ie, setIe] = useState(50);
  const [sn, setSn] = useState(50);
  const [tf, setTf] = useState(50);
  const [pj, setPj] = useState(50);

  const calculateMbti = () => {
    let result = '';
    result += ie < 50 ? 'I' : 'E';
    result += sn < 50 ? 'S' : 'N';
    result += tf < 50 ? 'T' : 'F';
    result += pj < 50 ? 'P' : 'J';
    return result;
  };

  const currentMbti = calculateMbti();

  useEffect(() => {
    onMbtiChange(currentMbti);
  }, [currentMbti]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Personality Type</Text>
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
          leftLabel="감각적" rightLabel="직관적"
          leftChar="S" rightChar="N"
          value={sn} onChange={setSn}
          onDragStart={onDragStart} onDragEnd={onDragEnd}
        />
        <MbtiSlider
          leftLabel="사고적" rightLabel="감정적"
          leftChar="T" rightChar="F"
          value={tf} onChange={setTf}
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
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.neutral.pureWhite,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  slidersContainer: {
    width: '100%',
    gap: 24,
  }
});
