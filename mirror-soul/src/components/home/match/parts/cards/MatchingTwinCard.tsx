import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '@/src/constants/theme';
import { rw } from '@/src/utils/responsive';

// 아이콘 에셋
import TwinCallIcon from '@/assets/images/common/matching/Twin_Call.svg';
import SummaryIcon from '@/assets/images/common/matching/TwinCallSummary.svg';
import CompleteIcon from '@/assets/images/common/matching/TwinSummaryComplete.svg';
import CancelIcon from '@/assets/images/common/Cancel.svg';
import TwinCallButtonIcon from '@/assets/images/common/matching/TwinCallButton.svg';

interface MatchingTwinCardProps {
  name: string;
  age: number;
  callCount: number;
  timeAgo: string;
  twinSatisfaction: number;
  summaries: string[];
  summaryHighlight: string;
}

/**
 * Twin 탭 전용 카드 컴포넌트 (시안 테마)
 */
export default function MatchingTwinCard({
  name = '정연',
  age = 31,
  callCount = 3,
  timeAgo = '5시간 전',
  twinSatisfaction = 67,
  summaries = ['여행과 사진에 열정적', '활발하고 긍정적인 에너지', '새로운 경험을 즐김'],
  summaryHighlight = '최근 여행 경험을 공유하며 즐겁게 대화했어요',
}: Partial<MatchingTwinCardProps>) {
  const { width } = useWindowDimensions();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 만족도 바 애니메이션 (0 -> 목표값)
    Animated.spring(progressAnim, {
      toValue: twinSatisfaction,
      tension: 20,
      friction: 7,
      useNativeDriver: false, // width 애니메이션이므로 false
    }).start();
  }, [twinSatisfaction]);

  return (
    <View style={styles.container}>
      {/* 메인 카드 영역 */}
      <View style={styles.mainCard}>
        {/* 1. 프로필 섹션 (시안-블루 그라디언트 헤더) */}
        <LinearGradient
          colors={Colors.gradient.twinCardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileSection, { height: rw(143.178), padding: rw(19.996) }]}
        >
          <View style={styles.profileRow}>
            {/* 프로필 이미지 */}
            <LinearGradient
              colors={[Colors.glass.cyan30_d3, Colors.glass.blue20]}
              style={[styles.profileImage, { width: rw(79.995), height: rw(79.995) }]}
            />
            
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{name}, {age}</Text>
              
              <View style={styles.histRow}>
                <View style={styles.callHistBadge}>
                  <TwinCallIcon width={rw(12)} height={rw(12)} />
                  <Text style={styles.callCountText}>{callCount}번 통화</Text>
                </View>
                <Text style={styles.timeText}>{timeAgo}</Text>
              </View>

              {/* 내 Twin 만족도 */}
              <View style={styles.satisfactionArea}>
                <View style={styles.satisfactionHeader}>
                  <Text style={styles.satisfactionLabel}>내 Twin 만족도</Text>
                  <Text style={styles.satisfactionValue}>{twinSatisfaction}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <Animated.View style={{
                    height: '100%',
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%']
                    }),
                  }}>
                    <LinearGradient
                      colors={Colors.gradient.twinProgress}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressBarFill}
                    />
                  </Animated.View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* 2. 대화 내용 요약 섹션 */}
        <View style={[styles.summarySection, { padding: rw(20) }]}>
          <View style={styles.sectionTitleRow}>
            <SummaryIcon width={rw(16)} height={rw(16)} />
            <Text style={styles.sectionTitle}>대화 내용 요약</Text>
          </View>
          
          <View style={styles.summaryContent}>
            {summaries.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <CompleteIcon width={rw(14)} height={rw(14)} />
                <Text style={styles.summaryText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* 하이라이트 요약 박스 */}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText} numberOfLines={2}>
              {summaryHighlight}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. 하단 액션 버튼 영역 */}
      <View style={[styles.actionRow, { height: rw(57.216) }]}>
        <TouchableOpacity activeOpacity={0.8} style={styles.nextButton}>
          <CancelIcon width={rw(24)} height={rw(24)} />
          <Text style={styles.buttonText}>다음에</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.callButtonContainer}>
          <LinearGradient
            colors={Colors.gradient.twinProgress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.callButton}
          >
            <TwinCallButtonIcon width={rw(20)} height={rw(20)} />
            <Text style={[styles.buttonText, { color: '#000' }]}>상대 Twin과 통화</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: 16,
  },
  mainCard: {
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    backgroundColor: Colors.glass.white05,
    overflow: 'hidden',
  },
  profileSection: {
    borderBottomWidth: 0.612,
    borderColor: Colors.glass.white10,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  profileImage: {
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  nameText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.449,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callHistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan30_d3,
    backgroundColor: Colors.glass.cyan20_d3,
  },
  callCountText: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  timeText: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  satisfactionArea: {
    marginTop: 4,
    gap: 4,
  },
  satisfactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  satisfactionLabel: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  satisfactionValue: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  progressBarBg: {
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  summarySection: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  summaryContent: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    color: Colors.neutral.lightGrayText,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  highlightBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20_d3,
    backgroundColor: Colors.glass.cyan10_d3,
  },
  highlightText: {
    color: '#53EAFD',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.75,
    letterSpacing: -0.15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white05,
  },
  buttonText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  callButtonContainer: {
    flex: 1,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radii.md2,
  },
});
