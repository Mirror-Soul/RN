import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface CallMetaProps {
  name: string;
  age: number | null;
  consistencyPercent: number | null;
  timeStr: string;
  durationLabel: string;
  tags: string[];
  isAnalyzing?: boolean;
}

/** 태그 chip 최대 표시 개수 */
const MAX_TAGS = 3;

/**
 * 통화 카드 메타 정보 컴포넌트 (SRP)
 * 이름/나이, 시간, 일치도%, 통화시간, 주제 태그를 렌더링합니다.
 * CallSubInfo + CallTagRow를 하나의 관심사로 통합합니다.
 */
export default function CallMeta({
  name,
  age,
  consistencyPercent,
  timeStr,
  durationLabel,
  tags,
  isAnalyzing = false,
}: CallMetaProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* Row 1: 이름·나이 (좌) / 시간 (우) */}
      <View style={styles.row}>
        <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
          {name}
          {age !== null && <Text style={[styles.ageText, { color: colors.text.muted }]}>, {age}</Text>}
        </Text>
        <Text style={[styles.timeText, { color: colors.text.muted }]}>{timeStr}</Text>
      </View>

      {/* Row 2: 일치도% + 통화시간 */}
      <View style={styles.row}>
        <View style={styles.metaItem}>
          <Feather name="zap" size={10} color={Colors.primary.electricCyan} />
          <Text style={styles.consistencyText}>{consistencyPercent === null ? '--' : `${consistencyPercent}%`}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={10} color={colors.text.muted} />
          <Text style={[styles.durationText, { color: colors.text.muted }]}>{durationLabel}</Text>
        </View>
      </View>

      {/* Row 3: 주제 태그 chips (최대 MAX_TAGS개), 분석 미완료 시 플레이스홀더 */}
      {isAnalyzing ? (
        <View style={styles.analyzingRow}>
          <Feather name="loader" size={10} color={colors.text.muted} />
          <Text style={[styles.analyzingText, { color: colors.text.muted }]}>대화 분석중</Text>
        </View>
      ) : (
        tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.slice(0, MAX_TAGS).map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: Spacing.xxs,
    minWidth: 0, // 텍스트 truncation을 위한 flex 레이아웃 보정
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.15,
    flex: 1,
  },
  ageText: {
    fontWeight: FontWeight.regular,
  },
  timeText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    flexShrink: 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  consistencyText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary.electricCyan,
  },
  durationText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xxs,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    marginTop: Spacing.xxs,
  },
  analyzingText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    fontStyle: 'italic',
  },
  tagChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.sm,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple20,
    backgroundColor: Colors.glass.purple10,
  },
  tagText: {
    color: Colors.primary.vividPurple,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
  },
});
