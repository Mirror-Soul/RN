import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { MatchingTabType } from './MatchingSummaryRow';

interface MatchingFooterProps {
  activeTab: MatchingTabType;
}

/**
 * 매칭 화면 하단 안내 배너
 */
export default function MatchingFooter({ activeTab }: MatchingFooterProps) {
  const { colors } = useThemeColors();

  const getFooterText = () => {
    if (activeTab === 'twin') return '상대의 Twin이 내 Twin과 대화한 결과예요';
    if (activeTab === 'recommend') return '통화 패턴을 분석하여 추천해드려요';
    return '상대방이 직접 당신과 통화하고 싶어해요';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <Text style={[styles.text, { color: colors.text.muted }]}>{getFooterText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: Radii.md2,
    borderWidth: 0.612,
  },
  text: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19.5,
  },
});
