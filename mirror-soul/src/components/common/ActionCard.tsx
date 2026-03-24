import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ActionCardProps {
  title: string;
  description: string;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * 재사용 가능한 메인 액션 카드 컴포넌트 (bo1, bo2 카드 대체)
 * 하드코딩된 너비/높이를 배제하고 유동적으로 대응하도록 구현.
 */
export default function ActionCard({ title, description, onPress, style }: ActionCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 32,
    letterSpacing: 0.07,
  },
  description: {
    color: '#99A1AF',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
