import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';

interface MainHeaderProps {
  onAvatarPress?: () => void;
}

/**
 * MainHeader 컴포넌트 (SRP)
 * 좌측 아바타(퀵액션시트 진입) 버튼, "Discovery" 타이틀 + 매칭 상태 배지를 렌더링합니다.
 * 우측은 History/Grow 헤더와 동일하게 44px 빈 슬롯으로 남겨 타이틀 중앙정렬을 유지합니다.
 */
export default function MainHeader({ onAvatarPress }: MainHeaderProps) {
  const { colors } = useThemeColors();
  const { matchingEnabled, handleToggle, isLoading, isToggling } = useMatchingStatus();
  const isMatching = matchingEnabled ?? false;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onAvatarPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="내 계정 메뉴 열기"
      >
        <Feather name="user" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Discovery</Text>
        <TouchableOpacity
          style={[
            styles.liveBadge,
            matchingEnabled === false && styles.liveBadgeOff,
          ]}
          onPress={handleToggle}
          disabled={isLoading || isToggling}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isMatching ? '매칭 중단하기' : '매칭 시작하기'}
        >
          <View style={[styles.liveDot, !isMatching && styles.liveDotOff]} />
          <Text style={[styles.liveText, matchingEnabled === false && styles.liveTextOff]}>
            {matchingEnabled === null ? '확인 중' : isMatching ? 'Live Sync' : '매칭 중단됨'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.iconSlot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: tabHeaderStyles.container,
  iconButton: tabHeaderStyles.iconButton,
  // History/Grow 헤더의 빈 슬롯과 동일 — iconButton의 borderWidth(테두리)까지 그대로
  // 빈 View에 씌우면 borderColor 미지정으로 검은 테두리 박스가 보인다.
  iconSlot: {
    width: 44,
    height: 44,
  },
  titleWrapper: {
    alignItems: 'center',
  },
  title: tabHeaderStyles.title,
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  liveBadgeOff: {
    backgroundColor: Colors.glass.white5,
    borderColor: Colors.glass.white10,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.electricCyan,
  },
  liveDotOff: {
    backgroundColor: Colors.neutral.darkGray,
  },
  liveText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.primary.electricCyan,
  },
  liveTextOff: {
    color: Colors.neutral.lightGrayText,
  },
});
