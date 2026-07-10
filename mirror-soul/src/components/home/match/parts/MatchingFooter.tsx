import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import { MatchingTabType } from './MatchingSummaryRow';

interface MatchingFooterProps {
  activeTab: MatchingTabType;
}

/**
 * 매칭 화면 하단 안내 배너
 */
export default function MatchingFooter({ activeTab }: MatchingFooterProps) {
  const { animatedGlassBackground, animatedBorder, animatedTextMuted } = useAnimatedTheme();

  const getFooterText = () => {
    if (activeTab === 'twin') return '상대의 Twin이 내 Twin과 대화한 결과예요';
    if (activeTab === 'recommend') return '통화 패턴을 분석하여 추천해드려요';
    return '상대방이 직접 당신과 통화하고 싶어해요';
  };

  return (
    <Animated.View style={[styles.container, animatedGlassBackground, animatedBorder]}>
      <Animated.Text style={[styles.text, animatedTextMuted]}>{getFooterText()}</Animated.Text>
    </Animated.View>
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
