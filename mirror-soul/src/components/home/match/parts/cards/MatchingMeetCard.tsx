import TimerIcon from '@/assets/images/common/evlove/evlove_timer.svg';
import MessageIcon from '@/assets/images/common/matching/MeetingMessage.svg';
import SummaryIcon from '@/assets/images/common/matching/MeetSummaryIcon.svg';
import MeetSummaryIcon from '@/assets/images/common/matching/meet_summary.svg';
import CompleteIcon from '@/assets/images/common/Complete.svg';
import CancelIcon from '@/assets/images/common/Cancel.svg';
import SendMessageIcon from '@/assets/images/common/matching/SendMessage.svg';
import SendCallIcon from '@/assets/images/common/matching/SendCall.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, useWindowDimensions } from 'react-native';

interface MatchingCardProps {
  name: string;
  age: number;
  timeAgo: string;
  twinSatisfaction: number;
  message: string;
  summaries: string[];
}

/**
 * 매칭 만남 신청 카드 컴포넌트
 */
export default function MatchingMeetCard({
  name = '민주',
  age = 27,
  timeAgo = '15분 전',
  twinSatisfaction = 73,
  message = 'Twin과 대화가 정말 즐거웠어요! 직접 만나서 커피 한잔 하면서 음악 이야기 더 나누고 싶어요 😊',
  summaries = ['음악 취향이 비슷해요', '여행 이야기로 공감대 형성', '대화 스타일이 편안했어요'],
}: Partial<MatchingMeetCardProps>) {
  const { width } = useWindowDimensions();
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 동적 사이즈 계산 함수 (피그마 392.927 기준)
  const rw = (val: number) => (width * val) / 392.927;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: twinSatisfaction,
      tension: 20,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [twinSatisfaction]);
  return (
    <View style={styles.container}>
      {/* 1. 상단 프로필 카드 (Container1) - 콘텐츠 기반 가변 높이 */}
      <View style={styles.mainContent}>
        {/* 헤드 영역 (그라디언트 배경) */}
        <LinearGradient
          colors={Colors.gradient.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeader}
        >
          <View style={styles.profileRow}>
            {/* 프로필 이미지 (목업) */}
            <LinearGradient
              colors={[Colors.glass.orange30, Colors.glass.red30]}
              style={styles.profileImage}
            />
            
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{name}, {age}</Text>
              
              <View style={styles.timerRow}>
                <TimerIcon width={12} height={12} />
                <Text style={styles.timerText}>{timeAgo}</Text>
              </View>

              {/* Twin 만족도 (연동형) */}
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
                      colors={Colors.gradient.meetProgress}
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

        {/* 바디 영역 (메시지 및 요약) - 가변 높이 적용 */}
        <View style={styles.cardBody}>
          {/* 메시지 섹션 */}
          <View style={styles.sectionHeader}>
            <MessageIcon width={16} height={16} />
            <Text style={styles.sectionTitle}>메시지</Text>
          </View>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          {/* 대화 요약 섹션 */}
          <View style={styles.sectionHeader}>
            <SummaryIcon width={16} height={16} />
            <Text style={styles.sectionTitle}>Twin 대화 요약</Text>
          </View>
          <View style={styles.summaryList}>
            {summaries.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <MeetSummaryIcon width={rw(14)} height={rw(14)} />
                <Text style={styles.summaryText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 2. 하단 액션 버튼 영역 (Container2) */}
      <View style={styles.actionArea}>
        <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
          <CancelIcon width={24} height={24} />
          <Text style={styles.actionText}>거절</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
          <SendMessageIcon width={24} height={24} />
          <Text style={styles.actionText}>메시지</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={[styles.actionButton, styles.callButton]}>
          <LinearGradient
            colors={Colors.gradient.meetProgress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <SendCallIcon width={24} height={24} />
          <Text style={[styles.actionText, { color: Colors.primary.soulBlack }]}>통화하기</Text>
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
  mainContent: {
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    backgroundColor: Colors.glass.white05,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 0.612,
    borderColor: Colors.glass.white10,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.449,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
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
    color: Colors.primary.mirrorOrange,
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
  cardBody: {
    padding: 20,
    gap: 12,
  },
  sectionHeader: {
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
  messageBox: {
    padding: 12,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.orange20,
    backgroundColor: Colors.glass.orange10,
    marginBottom: 8,
  },
  messageText: {
    color: Colors.neutral.softWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.75,
    letterSpacing: -0.15,
  },
  summaryList: {
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
  actionArea: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  actionButton: {
    flex: 1,
    height: 65,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white05,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  actionText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  callButton: {
    borderWidth: 0,
  },
});
