import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { PreferredRegion } from '@/src/types/api/home';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectedRegionsRowProps {
  selected: PreferredRegion[];
  maxSelectable: number;
  onRemove: (region: PreferredRegion) => void;
}

/** 현재 선택된 지역을 칩으로 보여주고, 칩의 X로 바로 해제할 수 있게 하는 요약 영역 */
export default function SelectedRegionsRow({ selected, maxSelectable, onRemove }: SelectedRegionsRowProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.row}>
      {selected.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.text.muted }]}>
          아직 선택한 지역이 없어요. 아래에서 최대 {maxSelectable}개까지 골라주세요.
        </Text>
      ) : (
        selected.map((region) => (
          <View key={region.sigunguId} style={[styles.chip, { backgroundColor: Colors.primary.electricCyan }]}>
            <Text style={styles.chipText}>{region.sigunguName}</Text>
            <TouchableOpacity
              onPress={() => onRemove(region)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`${region.sigunguName} 선택 해제`}
            >
              <Feather name="x" size={14} color={Colors.primary.soulBlack} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emptyText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  chipText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary.soulBlack,
  },
});
