import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useMbtiSlider } from './hooks/useMbtiSlider';
import MbtiLabels from './parts/MbtiLabels';
import MbtiTrack from './parts/MbtiTrack';

interface Props {
  leftLabel: string;
  rightLabel: string;
  leftChar: string;
  rightChar: string;
  value: number; // 0 to 100
  onChange: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function MbtiSlider({
  leftLabel,
  rightLabel,
  leftChar,
  rightChar,
  value,
  onChange,
  onDragStart,
  onDragEnd,
}: Props) {
  const {
    panResponder,
    animValue,
    setSliderWidth,
    measureContainer,
  } = useMbtiSlider({ value, onChange, onDragStart, onDragEnd });

  const percentage = Math.round(value);
  const percentText =
    value === 50
      ? '-'
      : value < 50
        ? `${100 - percentage}% ${leftLabel}`
        : `${percentage}% ${rightLabel}`;

  return (
    <View style={styles.container}>
      {/* 1. Header Labels & Percentage */}
      <MbtiLabels
        leftChar={leftChar}
        leftLabel={leftLabel}
        rightChar={rightChar}
        rightLabel={rightLabel}
        value={value}
        percentageText={percentText}
      />

      {/* 2. Slider Track & Handle */}
      <MbtiTrack
        panHandlers={panResponder.panHandlers}
        onLayout={setSliderWidth}
        measureContainer={measureContainer}
        animValue={animValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    gap: 16,
  },
});
