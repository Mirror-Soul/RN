import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import type { JobEnum } from '@/src/types/api/onboarding';

/** 제출 여부는 표시하지 않고 서버의 서류 심사 완료만 별도로 표현한다. */
export function ProfileJobBadge({ job, documentReviewed = false }: { job: JobEnum; documentReviewed?: boolean }) {
  const { palette } = useMatchingDesign();
  const label = JOB_LABEL[job] ?? job;
  return <View style={styles.row}><View accessible accessibilityLabel={`직업: ${label}`} style={[styles.badge, { backgroundColor: palette.tint, borderColor: palette.softBorder }]}>
    <BrowseIcon name="briefcase" size={13} color={palette.accentInk} />
    <Text style={[styles.label, { color: palette.accentInk }]}>{label}</Text>
  </View>{documentReviewed && <View accessible accessibilityLabel="직업 서류 확인. 제출 자료를 확인했으며 본인확인과는 별개입니다." style={[styles.badge, { backgroundColor: palette.coolTint, borderColor: palette.softBorder }]}><Text style={[styles.label, { color: palette.cyanInk }]}>직업 서류 확인</Text></View>}</View>;
}

const styles = StyleSheet.create({
  row: { maxWidth: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  badge: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  label: { flexShrink: 1, minWidth: 0, fontSize: 13, fontWeight: '500', lineHeight: 20 },
});
