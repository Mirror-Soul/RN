import BottomSheetModal from '@/src/components/home/common/BottomSheetModal';
import { LOCATION_DATA, MAX_SELECTABLE_LOCATIONS } from '@/src/constants/locationData';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LocationSelectModalProps {
  visible: boolean;
  initialSelected: string[];
  onClose: () => void;
  onConfirm: (locations: string[]) => void;
}

/**
 * LocationSelectModal 컴포넌트 (SRP)
 * 지역 다중 선택(최대 MAX_SELECTABLE_LOCATIONS개) UI만 담당합니다.
 * 바텀시트 프레임(백드롭/애니메이션)은 BottomSheetModal에 위임합니다 (DRY).
 */
export default function LocationSelectModal({
  visible,
  initialSelected,
  onClose,
  onConfirm,
}: LocationSelectModalProps) {
  const { colors } = useThemeColors();
  const [selected, setSelected] = useState<string[]>(initialSelected);

  React.useEffect(() => {
    if (visible) setSelected(initialSelected);
  }, [visible, initialSelected]);

  const toggleLocation = (loc: string) => {
    if (selected.includes(loc)) {
      setSelected(selected.filter((l) => l !== loc));
    } else if (selected.length < MAX_SELECTABLE_LOCATIONS) {
      setSelected([...selected, loc]);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>지역 설정</Text>
        <Text style={styles.counter}>{selected.length}/{MAX_SELECTABLE_LOCATIONS} 선택됨</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {Object.keys(LOCATION_DATA).map((city) => (
          <View key={city} style={styles.citySection}>
            <Text style={[styles.cityLabel, { color: colors.text.muted }]}>{city}</Text>
            <View style={styles.chipRow}>
              {LOCATION_DATA[city].map((loc) => {
                const isSelected = selected.includes(loc);
                return (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => toggleLocation(loc)}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                      isSelected && styles.chipSelected,
                    ]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.text.secondary },
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.confirmButton, { backgroundColor: colors.text.primary }]}
        onPress={() => {
          onConfirm(selected);
          onClose();
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="지역 설정 완료"
      >
        <Text style={[styles.confirmText, { color: colors.background.primary }]}>설정 완료</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  counter: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary.electricCyan,
  },
  list: {
    maxHeight: 360,
  },
  citySection: {
    marginBottom: Spacing.xxl,
  },
  cityLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: Colors.primary.electricCyan,
    borderColor: Colors.primary.electricCyan,
  },
  chipText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  chipTextSelected: {
    color: Colors.primary.soulBlack,
  },
  confirmButton: {
    marginTop: Spacing.lg,
    height: 64,
    borderRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
