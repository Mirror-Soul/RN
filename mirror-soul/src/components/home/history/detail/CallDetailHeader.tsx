import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import CallDetailHeaderLeft from './parts/CallDetailHeaderLeft';
import CallDetailHeaderRight from './parts/CallDetailHeaderRight';
import type { HistoryMenuAnchor } from './historyMenuLayout';

interface CallDetailHeaderProps {
  name: string;
  profileImageUrl?: string | null;
  description: string;
  callNumber?: number | null;
  onBack: () => void;
  onCallPress: () => void;
  onMorePress: () => void;
  callDisabled?: boolean;
  callBusy?: boolean;
  menuExpanded?: boolean;
  onMenuAnchorChange?: (anchor: HistoryMenuAnchor) => void;
}
export default function CallDetailHeader({ name, profileImageUrl, description, callNumber, onBack, onCallPress, onMorePress, callDisabled, callBusy, menuExpanded, onMenuAnchorChange }: CallDetailHeaderProps) {
  const { colors } = useMatchingDesign();
  const insets = useSafeAreaInsets();
  return <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.border.primary, backgroundColor: colors.background.primary }]}>
    <Pressable accessibilityRole="button" accessibilityLabel="기록으로 돌아가기" onPress={onBack} style={({ pressed }) => [styles.back, { backgroundColor: pressed ? colors.background.glass : 'transparent' }]}><Feather name="chevron-left" size={24} color={colors.text.primary} /></Pressable>
    <CallDetailHeaderLeft name={name} profileImageUrl={profileImageUrl} description={description} callNumber={callNumber} />
    <CallDetailHeaderRight onCallPress={onCallPress} onMorePress={onMorePress} callDisabled={callDisabled} callBusy={callBusy} menuExpanded={menuExpanded} onMenuAnchorChange={onMenuAnchorChange} />
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  back: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
});
