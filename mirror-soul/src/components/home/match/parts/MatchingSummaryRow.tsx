import MeetIcon from '@/assets/images/common/matching/MeetIcon.svg';
import TwinCallIcon from '@/assets/images/common/matching/TwinCall.svg';
import RecommendIcon from '@/assets/images/common/matching/MatchingRecommend.svg';
import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 매칭 요약 버튼 행 (만남 신청, Twin, 추천)
 */
export default function MatchingSummaryRow() {
  return (
    <View style={styles.container}>
      {/* 만남 신청 버튼 */}
      <TouchableOpacity activeOpacity={0.8} style={[styles.summaryButton, styles.meetButton]}>
        <View style={styles.buttonContent}>
          <MeetIcon width={20} height={20} />
          <Text style={[styles.buttonText, { color: '#FF8904' }]}>만남 신청</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(255, 137, 4, 0.30)' }]}>
            <Text style={[styles.badgeText, { color: '#FF8904' }]}>2</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Twin 버튼 */}
      <TouchableOpacity activeOpacity={0.8} style={styles.summaryButton}>
        <View style={styles.buttonContent}>
          <TwinCallIcon width={20} height={20} />
          <Text style={styles.buttonText}>Twin</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(0, 211, 243, 0.30)' }]}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 추천 버튼 */}
      <TouchableOpacity activeOpacity={0.8} style={styles.summaryButton}>
        <View style={styles.buttonContent}>
          <RecommendIcon width={20} height={20} />
          <Text style={styles.buttonText}>추천</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(194, 122, 255, 0.30)' }]}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
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
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white05,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  meetButton: {
    borderColor: 'rgba(255, 137, 4, 0.30)',
    backgroundColor: 'rgba(255, 137, 4, 0.20)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: Colors.neutral.lightGray,
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
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
