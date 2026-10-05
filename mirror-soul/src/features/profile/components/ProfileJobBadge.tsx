import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import type { JobEnum } from '@/src/types/api/onboarding';

/** A job label only. A submitted document is not evidence of approved verification. */
export function ProfileJobBadge({ job }: { job: JobEnum }) {
  const { palette } = useMatchingDesign();
  const label = JOB_LABEL[job] ?? job;
  return <View accessible accessibilityLabel={`직업: ${label}`} style={[styles.badge, { backgroundColor: palette.tint, borderColor: palette.softBorder }]}>
    <BrowseIcon name="briefcase" size={13} color={palette.accentInk} />
    <Text style={[styles.label, { color: palette.accentInk }]}>{label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  badge: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  label: { flexShrink: 1, minWidth: 0, fontSize: 13, fontWeight: '500', lineHeight: 20 },
});
