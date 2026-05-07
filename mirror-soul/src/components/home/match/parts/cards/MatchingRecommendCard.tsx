import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '@/src/constants/theme';

// 아이콘 에셋
import SummaryIcon from '@/assets/images/common/matching/RemmendSummary.svg';
import CallStyleIcon from '@/assets/images/common/matching/Call_Style.svg';
import TimerIcon from '@/assets/images/common/matching/Call_Style_Timer.svg';
import CancelIcon from '@/assets/images/common/Cancel.svg';
import TwinCallButtonIcon from '@/assets/images/common/matching/TwinCallButton.svg';

interface MatchingRecommendCardProps {
  name: string;
  age: number;
  bio: string;
  reasons: string[];
  avgCallMinutes: number;
  tags: string[];
}

/**
 * 추천 탭 전용 카드 컴포넌트
 */
export default function MatchingRecommendCard({
  name = '지연',
  age = 23,
  bio = '요가 강사이자 명상을 좋아하는 평화로운 영혼',
  reasons = ['둘 다 웰빙과 자기계발에 관심', '조용하고 깊이 있는 대화 선호', '비슷한 라이프스타일'],
  avgCallMinutes = 16,
  tags = ['헬스', '식단'],
}: Partial<MatchingRecommendCardProps>) {
  return (
    <View style={styles.container}>
      {/* 메인 카드 영역 */}
      <View style={styles.mainCard}>
        {/* 1. 프로필 섹션 (헤더 그라디언트) */}
        <LinearGradient
          colors={Colors.gradient.twinCardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}
        >
          <View style={styles.profileRow}>
            {/* 프로필 이미지 (목업 그라디언트) */}
            <LinearGradient
              colors={[Colors.glass.purple30, Colors.glass.pink30]}
              style={styles.profileImage}
            />
            
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{name}, {age}</Text>
              <Text style={styles.bioText} numberOfLines={2}>
                {bio}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* 2. 추천 이유 섹션 */}
        <View style={styles.summarySection}>
          <View style={styles.sectionTitleRow}>
            <SummaryIcon width={16} height={16} />
            <Text style={styles.sectionTitle}>추천 드린 이유</Text>
          </View>
          
          <View style={styles.reasonList}>
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <View style={styles.dot} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. 통화 스타일 섹션 */}
        <View style={styles.callStyleSection}>
          <View style={styles.sectionTitleRow}>
            <CallStyleIcon width={16} height={16} />
            <Text style={styles.sectionTitle}>통화 스타일</Text>
          </View>
          
          <View style={styles.callStyleBox}>
            <View style={styles.avgTimeRow}>
              <TimerIcon width={16} height={16} />
              <Text style={styles.avgTimeText}>평균 {avgCallMinutes}분</Text>
            </View>
            
            <View style={styles.tagRow}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 하단 액션 버튼 영역 */}
      <View style={styles.actionRow}>
        <TouchableOpacity activeOpacity={0.8} style={styles.cancelButton}>
          <CancelIcon width={24} height={24} />
          <Text style={styles.cancelButtonText}>건너뛰기</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.callButtonContainer}>
          <LinearGradient
            colors={Colors.gradient.twinCallButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.callButton}
          >
            <TwinCallButtonIcon width={20} height={20} />
            <Text style={styles.callButtonText}>상대 Twin과 통화</Text>
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
    padding: 20,
    borderBottomWidth: 0.612,
    borderColor: Colors.glass.white10,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
    gap: 8,
  },
  nameText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.45,
  },
  bioText: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.75,
    letterSpacing: -0.15,
  },
  summarySection: {
    padding: 20,
    gap: 12,
    borderBottomWidth: 0.612,
    borderColor: Colors.glass.white10,
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
  reasonList: {
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.vividPurple,
  },
  reasonText: {
    color: Colors.neutral.lightGrayText,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  callStyleSection: {
    padding: 20,
    gap: 12,
  },
  callStyleBox: {
    padding: 12,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple20,
    backgroundColor: Colors.glass.purple10,
    gap: 8,
  },
  avgTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avgTimeText: {
    color: Colors.neutral.lightGrayText,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.purple20,
  },
  tagText: {
    color: Colors.neutral.lavender,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white05,
  },
  cancelButtonText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.31,
  },
  callButtonContainer: {
    flex: 1,
    height: 57,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radii.md2,
  },
  callButtonText: {
    color: '#000', // 검정색 텍스트
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.31,
  },
});
