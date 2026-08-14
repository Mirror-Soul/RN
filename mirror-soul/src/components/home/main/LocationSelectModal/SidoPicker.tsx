import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { GroupedRegionOption } from '@/src/features/home/hooks/usePreferredRegionOptionsQuery';
import type { PreferredRegion } from '@/src/types/api/home';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SidoPickerProps {
  groupedOptions: GroupedRegionOption[];
  activeSidoName: string | null;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelectSido: (sidoName: string) => void;
  isRegionSelected: (region: PreferredRegion) => boolean;
}

/**
 * 시/도 선택 드롭다운. 17개 시/도를 가로 스크롤 탭으로 늘어놓으면 UX가 나빠지므로
 * 버튼 하나 + 절대 위치 오버레이 리스트로 구성한다 — 열려도 시트 높이에 영향을 주지 않는다.
 */
export default function SidoPicker({
  groupedOptions,
  activeSidoName,
  isOpen,
  onToggleOpen,
  onSelectSido,
  isRegionSelected,
}: SidoPickerProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.anchor}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onToggleOpen}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="시/도 선택"
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={[styles.buttonText, { color: colors.text.primary }]}>{activeSidoName ?? '시/도 선택'}</Text>
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.muted} />
      </TouchableOpacity>

      {isOpen && (
        <>
          {/* 바텀시트 밖 영역까지 덮어 바깥을 탭하면 드롭다운만 닫히게 한다 (레이아웃엔 영향 없음) */}
          <Pressable style={styles.backdrop} onPress={onToggleOpen} />
          <View style={[styles.list, { backgroundColor: colors.background.elevated, borderColor: colors.border.primary }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {groupedOptions.map(({ sidoName, sigungus }) => {
                const isActive = sidoName === activeSidoName;
                const selectedCount = sigungus.filter(isRegionSelected).length;
                return (
                  <TouchableOpacity
                    key={sidoName}
                    onPress={() => onSelectSido(sidoName)}
                    style={styles.item}
                    activeOpacity={0.7}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        { color: isActive ? Colors.primary.electricCyan : colors.text.secondary },
                      ]}
                    >
                      {sidoName}
                      {selectedCount > 0 ? ` · ${selectedCount}개 선택` : ''}
                    </Text>
                    {isActive && <Feather name="check" size={16} color={Colors.primary.electricCyan} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    zIndex: 20,
    elevation: 20,
    marginBottom: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  backdrop: {
    position: 'absolute',
    top: 48,
    left: -1000,
    right: -1000,
    height: 2000,
    zIndex: 20,
  },
  list: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 220,
    borderRadius: Radii.md,
    borderWidth: 1,
    zIndex: 21,
    elevation: 21,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  itemText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
