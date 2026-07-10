import NoMeetingIcon from '@/assets/images/common/matching/NoMeeting.svg';
import TwinCallIcon from '@/assets/images/common/matching/Twin_Call.svg';
import OnRecommendIcon from '@/assets/images/common/matching/OnRecommend.svg';
import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export type MatchingTabType = 'meet' | 'twin' | 'recommend';

interface MatchingSummaryRowProps {
  activeTab: MatchingTabType;
  onTabChange: (tab: MatchingTabType) => void;
}

/**
 * 매칭 요약 버튼 행 (만남 신청, Twin, 추천)
 */
export default function MatchingSummaryRow({ activeTab, onTabChange }: MatchingSummaryRowProps) {
  const { animatedGlassBackground, animatedBorder, animatedTextMuted } = useAnimatedTheme();

  return (
    <View style={styles.container}>
      {/* 만남 신청 버튼 */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => onTabChange('meet')}
      >
        <Animated.View style={[
          styles.summaryButton, 
          animatedGlassBackground,
          animatedBorder,
          activeTab === 'meet' && styles.meetButtonActive
        ]}>
          <View style={styles.buttonContent}>
            <NoMeetingIcon width={20} height={20} />
            <Animated.Text style={[
              styles.buttonText, 
              animatedTextMuted,
              activeTab === 'meet' && { color: Colors.primary.mirrorOrange }
            ]}>만남 신청</Animated.Text>
            <View style={[
              styles.badge, 
              { backgroundColor: activeTab === 'meet' ? Colors.glass.orange30 : 'rgba(255, 137, 4, 0.30)' }
            ]}>
              <Animated.Text style={[
                styles.badgeText, 
                animatedTextMuted,
                activeTab === 'meet' && { color: Colors.primary.mirrorOrange }
              ]}>2</Animated.Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Twin 버튼 */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => onTabChange('twin')}
      >
        <Animated.View style={[
          styles.summaryButton, 
          animatedGlassBackground,
          animatedBorder,
          activeTab === 'twin' && styles.twinButtonActive
        ]}>
          <View style={styles.buttonContent}>
            <TwinCallIcon width={20} height={20} />
            <Animated.Text style={[
              styles.buttonText, 
              animatedTextMuted,
              activeTab === 'twin' && { color: Colors.primary.electricCyan }
            ]}>Twin</Animated.Text>
            <View style={[
              styles.badge, 
              { backgroundColor: activeTab === 'twin' ? Colors.glass.cyan30 : 'rgba(0, 211, 243, 0.30)' }
            ]}>
              <Animated.Text style={[
                styles.badgeText, 
                animatedTextMuted,
                activeTab === 'twin' && { color: Colors.primary.electricCyan }
              ]}>2</Animated.Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* 추천 버튼 */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => onTabChange('recommend')}
      >
        <Animated.View style={[
          styles.summaryButton, 
          animatedGlassBackground,
          animatedBorder,
          activeTab === 'recommend' && styles.recommendButtonActive
        ]}>
          <View style={styles.buttonContent}>
            <OnRecommendIcon width={20} height={20} />
            <Animated.Text style={[
              styles.buttonText, 
              animatedTextMuted,
              activeTab === 'recommend' && { color: Colors.primary.vividPurple }
            ]}>추천</Animated.Text>
            <View style={[
              styles.badge, 
              { backgroundColor: activeTab === 'recommend' ? Colors.glass.purple30 : 'rgba(194, 122, 255, 0.30)' }
            ]}>
              <Animated.Text style={[
                styles.badgeText, 
                animatedTextMuted,
                activeTab === 'recommend' && { color: Colors.primary.vividPurple }
              ]}>2</Animated.Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 8,
  },
  summaryButton: {
    flex: 1,
    height: 45,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  meetButtonActive: {
    borderColor: Colors.glass.orange30,
    backgroundColor: Colors.glass.orange20,
  },
  twinButtonActive: {
    borderColor: Colors.glass.cyan30_d3,
    backgroundColor: Colors.glass.cyan20_d3,
  },
  recommendButtonActive: {
    borderColor: Colors.glass.purple30,
    backgroundColor: Colors.glass.purple20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
