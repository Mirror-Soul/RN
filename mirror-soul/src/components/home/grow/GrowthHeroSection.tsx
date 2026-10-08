import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { Colors } from '@/src/constants/theme';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { getSyncCopy } from './growthSyncCopy';
import { useLayout } from '@/src/hooks/useLayout';

interface Props {
  similarityPercent: number | null;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  jobStatusLabel?: string;
  jobSubmitted?: boolean | null;
  jobLoading: boolean;
  jobError: boolean;
  onVerifyPress: () => void;
}
export default function GrowthHeroSection({ similarityPercent, isLoading, isError, onRetry, jobSubmitted, jobStatusLabel, jobLoading, jobError, onVerifyPress }: Props) {
  const { colors, palette } = useMatchingDesign();
  const { cardWidth } = useLayout();
  const { fontScale } = useWindowDimensions();
  const compact = cardWidth < 300 || fontScale > 1.4;
  const hasValue = typeof similarityPercent === 'number' && Number.isFinite(similarityPercent);
  const percent = hasValue ? Math.min(100, Math.max(0, similarityPercent)) : 0;
  const copy = getSyncCopy(percent);
  const headline = isLoading ? '트윈을 확인하고 있어요.' : hasValue ? copy.headline : '나를 닮은 트윈을 준비하고 있어요.';
  const value = isLoading ? '확인 중' : isError ? '다시 확인' : hasValue ? `${percent}%` : '준비 중';
  const jobHint = jobStatusLabel ?? (jobLoading ? '서류 제출 여부 확인 중' : jobError ? '제출 여부를 다시 확인해 주세요' : jobSubmitted ? '가입 때 추가한 서류가 있어요. 심사 결과와는 별개예요.' : '직업 확인 서류 안내와 사진 선택');
  return <View style={styles.container}>
    <View style={[styles.headlineRow, compact && styles.compactRow]}>
      <View style={[styles.headlineCopy, compact && styles.compactCopy]}>
    {isError ? <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="트윈 준비도 다시 조회" style={styles.retry}>
      <Text variant="heading" style={[styles.headline, { color: colors.text.primary }]}>트윈 정보를 불러오지 못했어요</Text><Text style={[styles.copy, { color: palette.cyanInk }]}>눌러서 다시 확인해 주세요.</Text>
    </Pressable> : <Text variant="heading" style={[styles.headline, { color: colors.text.primary }]}>{headline}</Text>}
      </View>
      <Pressable onPress={onVerifyPress} accessibilityRole="button" accessibilityLabel="직업 서류 확인하기" accessibilityHint={jobHint} style={({ pressed }) => [styles.job, compact && styles.compactJob, { borderColor: colors.border.primary, backgroundColor: pressed ? palette.coolTint : colors.background.card }]}>
        <Feather name="briefcase" size={16} color={palette.cyanInk} />
        <Text style={[styles.jobTitle, { color: colors.text.primary }]}>직업 서류</Text>
      </Pressable>
    </View>
    {!isError && <Text style={[styles.copy, { color: colors.text.secondary }]}>{isLoading ? '잠시만 기다려 주세요.' : hasValue ? copy.subCopy : '학습이 반영되면 준비도를 확인할 수 있어요.'}</Text>}
    <View accessibilityRole="progressbar" accessibilityLabel="트윈 준비도" accessibilityValue={{ min: 0, max: 100, ...(hasValue && !isLoading && !isError ? { now: percent } : {}), text: value }} style={[styles.track, { backgroundColor: colors.background.glass }]}>
      {hasValue && !isLoading && !isError && <LinearGradient colors={Colors.gradient.cyanBluePurple} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.fill, { width: `${percent}%` }]} />}
    </View>
    <View style={styles.progressLabels}><Text style={[styles.caption, { color: colors.text.secondary }]}>트윈 준비도</Text><Text style={[styles.caption, { color: palette.cyanInk }]}>{value}</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', gap: 12 },
  headline: { fontSize: 28, lineHeight: 38, fontWeight: '600' },
  copy: { fontSize: 14, lineHeight: 23 },
  retry: { minHeight: 48, gap: 8 },
  track: { height: 6, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  progressLabels: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  caption: { fontSize: 12, lineHeight: 20 },
  headlineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  compactRow: { flexDirection: 'column-reverse', alignItems: 'stretch', gap: 8 },
  headlineCopy: { flex: 1, minWidth: 0 },
  compactCopy: { flex: 0 },
  compactJob: { alignSelf: 'flex-end' },
  job: { alignSelf: 'flex-start', maxWidth: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  jobTitle: { flexShrink: 1, fontSize: 12, lineHeight: 20, fontWeight: '600' },
});
