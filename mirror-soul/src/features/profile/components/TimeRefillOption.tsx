import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { TimeRefillOptionData, formatRefillPrice, getTimeRefillSavings } from '../constants/timeRefillOptions';

export function TimeRefillOption({ option, selected = false, onPress, disabled = false }: {
  option: TimeRefillOptionData;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { colors, palette } = useMatchingDesign();
  const { width, fontScale } = useWindowDimensions();
  const savings = getTimeRefillSavings(option);
  const stacked = width < 350 || fontScale > 1.3;
  return (
    <Pressable accessibilityRole="radio" accessibilityLabel={`${option.addedTime}, 가격 예시 ${formatRefillPrice(option.priceWon)}`}
      accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.card, {
        backgroundColor: selected ? palette.secondaryButton : colors.background.card,
        borderColor: selected ? palette.buttonBorder : colors.border.primary,
        opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
      }]}>
      <View style={[styles.row, stacked && styles.stacked]}>
        <View style={styles.identity}>
          <BrowseIcon name={selected ? 'check-circle' : 'circle'} size={24} color={selected ? palette.cyanInk : colors.text.muted} />
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text variant="heading" style={[styles.time, { color: colors.text.primary }]}>{option.addedTime}</Text>
              {option.badge && <View style={[styles.badge, { backgroundColor: palette.tint }]}>
                <Text style={[styles.badgeLabel, { color: palette.accentInk }]}>{option.badge}</Text>
              </View>}
            </View>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{option.durationLabel}</Text>
          </View>
        </View>
        <View style={[styles.priceGroup, stacked && styles.stackedPrice]}>
          {savings.savingsWon > 0 && <Text style={[styles.reference, { color: colors.text.muted }]}>{formatRefillPrice(savings.referencePriceWon)}</Text>}
          <Text style={[styles.price, { color: colors.text.primary }]}>{formatRefillPrice(option.priceWon)}</Text>
        </View>
      </View>
      {savings.savingsWon > 0 && <Text style={[styles.savings, { color: palette.cyanInk }]}>
        {formatRefillPrice(savings.savingsWon)} 절약 · 약 {savings.savingsPercent}%
      </Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1, borderRadius: 18, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  identity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  time: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 20 },
  badge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  badgeLabel: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  priceGroup: { maxWidth: '50%', alignItems: 'flex-end', gap: 2 },
  stackedPrice: { maxWidth: '100%', alignItems: 'flex-start', paddingLeft: 34 },
  reference: { fontSize: 12, lineHeight: 18, textDecorationLine: 'line-through' },
  price: { fontSize: 19, lineHeight: 27, fontWeight: '600', fontVariant: ['tabular-nums'] },
  savings: { fontSize: 13, lineHeight: 20, fontWeight: '500', paddingLeft: 34 },
});
