import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { MatchAvatar } from '@/src/features/match/components/MatchAvatar';

export default function CallDetailHeaderLeft({ name, profileImageUrl, description, callNumber }: {
  name: string; profileImageUrl?: string | null; description: string; callNumber?: number | null;
}) {
  const { colors } = useMatchingDesign();
  const { width, fontScale } = useWindowDimensions();
  return <View style={styles.container}>
    {width >= 390 && fontScale <= 1.3 && <MatchAvatar name={name} url={profileImageUrl ?? null} size={34} />}
    <View style={styles.copy}>
      <Text variant="heading" numberOfLines={1} ellipsizeMode="tail" accessibilityLabel={`${name || '상대방'}님`} accessibilityHint={`${description}${callNumber ? `, ${callNumber}번째 통화` : ''}`} style={[styles.name, { color: colors.text.primary }]}>{name || '상대방'}님</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>대화 기록</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  copy: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  subtitle: { fontSize: 11, lineHeight: 18 },
});
