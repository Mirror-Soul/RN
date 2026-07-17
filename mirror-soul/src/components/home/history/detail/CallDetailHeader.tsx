import RightNarrowIcon from '@/assets/images/common/Right_narrow.svg';
import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface CallDetailHeaderProps {
  name: string;
  age: number;
  callSequenceNumber: number;
  consistencyPercent: number;
  onBack: () => void;
}

/**
 * 통화 상세 헤더 (SRP)
 * 뒤로가기 버튼, 이름/나이/부제목, 일치도 배지를 렌더링합니다.
 */
export default function CallDetailHeader({
  name,
  age,
  callSequenceNumber,
  consistencyPercent,
  onBack,
}: CallDetailHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* 뒤로가기 */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <RightNarrowIcon
            width={20}
            height={20}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>

        {/* 이름 + 부제목 */}
        <View style={styles.content}>
          <Text style={styles.title}>{name}, {age}</Text>
          <Text style={styles.subtitle}>
            {name}님과의 {callSequenceNumber}번 째 대화 내용
          </Text>
        </View>

        {/* 일치도 배지 */}
        <LinearGradient
          colors={[Colors.glass.cyan20, Colors.glass.purple20]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>{consistencyPercent}%</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.white10,
    backgroundColor: Colors.glass.black40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
    height: 52,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontFamily: FontFamily.sans,
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.07,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: 'rgba(0, 211, 243, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
