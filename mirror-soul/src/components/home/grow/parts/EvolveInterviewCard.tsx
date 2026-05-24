import InterviewIcon from '@/assets/images/common/evlove/evlove_interview.svg';
import TimerIcon from '@/assets/images/common/evlove/evlove_timer.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 나를 알아가는 인터뷰 카드 (SRP)
 */
export default function EvolveInterviewCard() {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="나를 알아가는 인터뷰 미션"
      accessibilityHint="AI와 대화하여 가치관을 공유하는 인터뷰 화면으로 이동"
    >
      <LinearGradient
        colors={[Colors.glass.purple20, Colors.glass.pink20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          {/* 아이콘 */}
          <View style={styles.iconBg}>
            <InterviewIcon width={20} height={20} />
          </View>
          
          {/* NEW 배지 */}
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>나를 알아가는 인터뷰</Text>
          <Text style={styles.subTitle}>AI와 대화하며 내 가치관 공유하기</Text>
        </View>

        <View style={styles.footer}>
          <TimerIcon width={16} height={16} />
          <Text style={styles.timeText}>15분</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple30,
    alignSelf: 'stretch',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.purple30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.smmd,
    borderWidth: 0.612,
    borderColor: Colors.glass.gold40,
    backgroundColor: Colors.glass.gold20,
  },
  newText: {
    color: Colors.primary.goldText,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  content: {
    gap: 4,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  subTitle: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    color: Colors.neutral.darkGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
