import TimerIcon from '@/assets/images/common/evlove/evlove_timer.svg';
import MeetSummaryIcon from '@/assets/images/common/matching/meet_summary.svg';
import MessageIcon from '@/assets/images/common/matching/MeetingMessage.svg';
import SummaryIcon from '@/assets/images/common/matching/MeetSummaryIcon.svg';

import CancelIcon from '@/assets/images/common/Cancel.svg';
import SendCallIcon from '@/assets/images/common/matching/SendCall.svg';
import SendMessageIcon from '@/assets/images/common/matching/SendMessage.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated as RNAnimated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface MatchingMeetCardProps {
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
  const { rw } = useLayout();
  const progressAnim = useRef(new RNAnimated.Value(0)).current;
  const { animatedCardBackground, animatedBorder, animatedGlassBackground, animatedText, animatedTextSecondary, animatedTextMuted } = useAnimatedTheme();

  useEffect(() => {
    RNAnimated.spring(progressAnim, {
      toValue: twinSatisfaction,
      tension: 20,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [twinSatisfaction]);
  return (
    <View style={styles.container}>
      {/* 1. 상단 프로필 카드 (Container1) - 콘텐츠 기반 가변 높이 */}
      <Animated.View style={[styles.mainContent, animatedCardBackground, animatedBorder]}>
        {/* 헤드 영역 (그라디언트 배경) */}
        <AnimatedLinearGradient
          colors={Colors.gradient.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardHeader, animatedBorder]}
        >
          <View style={styles.profileRow}>
            {/* 프로필 이미지 (목업) */}
            <AnimatedLinearGradient
              colors={[Colors.glass.orange30, Colors.glass.red30]}
              style={[styles.profileImage, animatedBorder]}
            />

            <View style={styles.profileInfo}>
              <Animated.Text style={[styles.nameText, animatedText]}>{name}, {age}</Animated.Text>

              <View style={styles.timerRow}>
                <TimerIcon width={12} height={12} />
                <Animated.Text style={[styles.timerText, animatedTextMuted]}>{timeAgo}</Animated.Text>
              </View>

              {/* Twin 만족도 (연동형) */}
              <View style={styles.satisfactionArea}>
                <View style={styles.satisfactionHeader}>
                  <Animated.Text style={[styles.satisfactionLabel, animatedTextMuted]}>내 Twin 만족도</Animated.Text>
                  <Animated.Text style={styles.satisfactionValue}>{twinSatisfaction}%</Animated.Text>
                </View>
                <Animated.View style={[styles.progressBarBg, animatedGlassBackground]}>
                  <RNAnimated.View style={{
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
                  </RNAnimated.View>
                </Animated.View>
              </View>
            </View>
          </View>
        </AnimatedLinearGradient>

        {/* 바디 영역 (메시지 및 요약) - 가변 높이 적용 */}
        <View style={styles.cardBody}>
          {/* 메시지 섹션 */}
          <View style={styles.sectionHeader}>
            <MessageIcon width={16} height={16} />
            <Animated.Text style={[styles.sectionTitle, animatedText]}>메시지</Animated.Text>
          </View>
          <View style={styles.messageBox}>
            <Animated.Text style={[styles.messageText, animatedTextSecondary]}>{message}</Animated.Text>
          </View>

          {/* 대화 요약 섹션 */}
          <View style={styles.sectionHeader}>
            <SummaryIcon width={16} height={16} />
            <Animated.Text style={[styles.sectionTitle, animatedText]}>Twin 대화 요약</Animated.Text>
          </View>
          <View style={styles.summaryList}>
            {summaries.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <MeetSummaryIcon width={rw(14)} height={rw(14)} />
                <Animated.Text style={[styles.summaryText, animatedTextMuted]}>{item}</Animated.Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* 2. 하단 액션 버튼 영역 (Container2) */}
      <View style={styles.actionArea}>
        <AnimatedTouchableOpacity activeOpacity={0.8} style={[styles.actionButton, animatedGlassBackground, animatedBorder]}>
          <CancelIcon width={24} height={24} />
          <Animated.Text style={[styles.actionText, animatedText]}>거절</Animated.Text>
        </AnimatedTouchableOpacity>

        <AnimatedTouchableOpacity activeOpacity={0.8} style={[styles.actionButton, animatedGlassBackground, animatedBorder]}>
          <SendMessageIcon width={24} height={24} />
          <Animated.Text style={[styles.actionText, animatedText]}>메시지</Animated.Text>
        </AnimatedTouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={[styles.actionButton, styles.callButton]}>
          <LinearGradient
            colors={Colors.gradient.meetProgress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <SendCallIcon width={24} height={24} />
          <Animated.Text style={[styles.actionText, { color: Colors.primary.soulBlack }]}>통화하기</Animated.Text>
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
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 0.612,
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
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameText: {
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  actionText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  callButton: {
    borderWidth: 0,
  },
});
