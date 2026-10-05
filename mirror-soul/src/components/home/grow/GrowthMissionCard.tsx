import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { Colors } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';

interface Props {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Feather>['name'] | 'gamepad';
  tone?: 'cyan' | 'purple' | 'pink';
  status?: string | null;
  error?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

/** Keep status next to the title; allow a separate row when accessibility text needs space. */
export default function GrowthMissionCard({ title, subtitle, icon, tone = 'cyan', status, error, disabled, onPress, accessibilityLabel, accessibilityHint }: Props) {
  const { colors, palette, isDark } = useMatchingDesign();
  const { cardWidth } = useLayout();
  const { fontScale } = useWindowDimensions();
  const compact = cardWidth < 300 || fontScale > 1.3;
  const [copyWidth, setCopyWidth] = React.useState<number | null>(null);
  const stacked = fontScale > 1.4 || (copyWidth !== null && copyWidth < 195);
  const tint = tone === 'pink' ? Colors.glass.pink20 : tone === 'purple' ? palette.tint : palette.coolTint;
  const ink = tone === 'pink' ? (isDark ? Colors.primary.vividPink : colors.text.secondary) : tone === 'purple' ? palette.accentInk : palette.cyanInk;
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled: !!disabled }} style={({ pressed }) => [styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary, opacity: pressed ? 0.8 : 1 }]}>
    <View style={[styles.icon, { backgroundColor: tint, width: compact ? 40 : 52, height: compact ? 40 : 52 }]}>{icon === 'gamepad' ? <MaterialCommunityIcons name="gamepad-variant-outline" size={compact ? 24 : 28} color={ink} /> : <Feather name={icon} size={compact ? 22 : 26} color={ink} />}</View>
    <View style={styles.copy} onLayout={event => setCopyWidth(event.nativeEvent.layout.width)}>
      <View testID="growth-mission-heading" style={[styles.heading, stacked && styles.stackedHeading]}>
        <Text variant="heading" style={[styles.title, { color: colors.text.primary }, stacked && styles.stackedTitle]}>{title}</Text>
        {!!status && <Text style={[styles.status, { color: ink, backgroundColor: tint }, stacked && styles.stackedStatus]}>{status}</Text>}
      </View>
      <Text style={[styles.subtitle, { color: error ? colors.state.danger : colors.text.secondary }]}>{subtitle}</Text>
    </View>
    {onPress && !disabled && <Feather name="chevron-right" size={18} color={colors.text.muted} />}
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 22, padding: 16, alignSelf: 'stretch' },
  icon: { flexShrink: 0, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stackedHeading: { flexDirection: 'column', alignItems: 'flex-start', gap: 4 },
  title: { flex: 1, minWidth: 0, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  stackedTitle: { flex: 0, alignSelf: 'stretch' },
  subtitle: { fontSize: 13, lineHeight: 21 },
  status: { maxWidth: '45%', flexShrink: 1, fontSize: 11, lineHeight: 18, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  stackedStatus: { maxWidth: '100%' },
});
