import { Colors, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CallAvatar from './HistoryCallCard/CallProfile';
import CallMeta from './HistoryCallCard/CallSubInfo';

/**
 * 통화 내 단일 메시지 데이터 모델 (SRP)
 */
export interface ChatMessage {
  id: string;
  direction: 'SENT' | 'RECEIVED'; // SENT = 나의 Twin, RECEIVED = 상대방
  text: string;
  timestamp: string;               // "11:15" 형식
  isEdited?: boolean;
}

export interface HistoryCallItemData {
  id: string;
  name: string;
  age: number;
  consistencyPercent: number;
  callSequenceNumber: number;      // N번 째 대화
  dateStr: string;
  timeStr: string;
  profileImageUrl?: string;
  direction: 'SENT' | 'RECEIVED';
  callTypeDesc: string;
  durationLabel: string;
  twinMatchLabel: string;
  tags: string[];
  isNew?: boolean;                 // 새로운 통화 기록 여부 (읽지 않음)
  satisfactionPercent?: number;    // 만족도 퍼센트
  messages: ChatMessage[];         // 통화 내 메시지 목록
}

interface HistoryCallCardProps {
  data: HistoryCallItemData;
  index?: number;               // stagger 애니메이션용
  onPress?: () => void;
}

/**
 * 개별 통화 기록 단위 카드 컴포넌트
 *
 * 레이아웃:
 *   [CallAvatar] [CallMeta(이름/일치도/시간/태그)] [ChevronRight]
 *
 * isNew=true 시:
 *   - electricCyan 테두리
 *   - 우상단 cyan glowing dot indicator
 */
export default function HistoryCallCard({ data, index = 0, onPress }: HistoryCallCardProps) {
  const { colors } = useThemeColors();

  const borderColor = data.isNew
    ? Colors.primary.electricCyan
    : colors.border.primary;

  const backgroundColor = data.isNew
    ? Colors.glass.cyan10_d3
    : colors.background.glass;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(350).springify()}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor, borderColor }]}
        onPress={onPress}
        activeOpacity={0.82}
        accessibilityRole="button"
      >
        {/* 아바타 + 방향 배지 */}
        <CallAvatar
          name={data.name}
          profileImageUrl={data.profileImageUrl}
          direction={data.direction}
        />

        {/* 이름 / 일치도 / 시간 / 태그 */}
        <CallMeta
          name={data.name}
          age={data.age}
          consistencyPercent={data.consistencyPercent}
          timeStr={data.timeStr}
          durationLabel={data.durationLabel}
          tags={data.tags}
        />

        {/* ChevronRight */}
        <Feather name="chevron-right" size={16} color={colors.text.muted} style={styles.chevron} />

        {/* NEW dot indicator (isNew=true 시에만) */}
        {data.isNew && <View style={styles.newDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
    borderRadius: Radii.xxl,   // 32px — 레퍼런스의 rounded-3xl
    borderWidth: 0.612,
  },
  chevron: {
    flexShrink: 0,
  },
  newDot: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.xxxl,       // ChevronRight 좌측
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
  },
});
