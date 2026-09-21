import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontWeight, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';
import { AnimatedSwitch } from '@/src/components/common/AnimatedSwitch';

interface MainHeaderProps {
  onAvatarPress?: () => void;
}

/**
 * MainHeader 컴포넌트 (SRP)
 * 좌측은 History/Grow 헤더와 동일한 44px 빈 슬롯, 중앙은 "Discovery" 타이틀 + 매칭
 * On/Off 스위치, 우측은 아바타(퀵액션시트 진입) 버튼을 렌더링합니다.
 * 매칭 스위치는 공용 AnimatedSwitch(알림 설정 등에서 이미 쓰는 컴포넌트)를 재사용해
 * "탭 가능한 토글"이라는 것이 형태만으로 바로 읽히게 한다.
 */
export default function MainHeader({ onAvatarPress }: MainHeaderProps) {
  const { colors } = useThemeColors();
  const { matchingEnabled, handleToggle, isLoading, isToggling } = useMatchingStatus();
  const isMatching = matchingEnabled ?? false;
  const statusLabel = matchingEnabled === null ? '확인 중' : isMatching ? '매칭 켜짐' : '매칭 꺼짐';

  return (
    <View style={styles.container}>
      <View style={styles.iconSlot} />

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Discovery</Text>
        <View style={styles.matchingRow}>
          <Text
            style={[
              styles.matchingLabel,
              { color: isMatching ? Colors.primary.electricCyan : colors.text.muted },
            ]}
          >
            {statusLabel}
          </Text>
          <AnimatedSwitch
            value={isMatching}
            onToggle={handleToggle}
            disabled={isLoading || isToggling || matchingEnabled === null}
            accessibilityLabel={isMatching ? '매칭 중단하기' : '매칭 시작하기'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onAvatarPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="내 계정 메뉴 열기"
      >
        <Feather name="user" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
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
  matchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  matchingLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
});
