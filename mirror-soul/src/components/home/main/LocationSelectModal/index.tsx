import BottomSheetModal from '@/src/components/home/common/BottomSheetModal';
import FloatingNotice from '@/src/components/home/common/FloatingNotice';
import RegionSearchInput from './RegionSearchInput';
import SelectedRegionsRow from './SelectedRegionsRow';
import SidoPicker from './SidoPicker';
import { usePreferredRegionOptionsQuery } from '@/src/features/home/hooks/usePreferredRegionOptionsQuery';
import { useFloatingNotice } from '@/src/hooks/useFloatingNotice';
import { MAX_SELECTABLE_LOCATIONS } from '@/src/constants/locationData';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import type { PreferredRegion } from '@/src/types/api/home';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LocationSelectModalProps {
  visible: boolean;
  initialSelected: PreferredRegion[];
  onClose: () => void;
  /** 저장을 수행하고 완료될 때까지 대기할 Promise를 반환해야 한다. 실패 시 reject하면 시트를 닫지 않고 에러를 보여준다. */
  onConfirm: (regions: PreferredRegion[]) => Promise<void>;
}

/**
 * LocationSelectModal 컴포넌트 (SRP)
 * 지역 다중 선택(최대 MAX_SELECTABLE_LOCATIONS개) UI의 오케스트레이션만 담당하고,
 * 각 영역(선택 요약/시도 드롭다운/검색창)은 하위 컴포넌트에 위임한다.
 * 바텀시트 프레임(백드롭/애니메이션)은 BottomSheetModal에 위임한다 (DRY).
 */
export default function LocationSelectModal({
  visible,
  initialSelected,
  onClose,
  onConfirm,
}: LocationSelectModalProps) {
  const { colors } = useThemeColors();
  const { data: groupedOptions, isLoading, isError, refetch } = usePreferredRegionOptionsQuery();
  const [selected, setSelected] = useState<PreferredRegion[]>(initialSelected);
  const [activeSidoName, setActiveSidoName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidoPickerOpen, setIsSidoPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message: noticeMessage, opacity: noticeOpacity, flash: flashNotice } = useFloatingNotice();

  React.useEffect(() => {
    if (visible) {
      setSelected(initialSelected);
      setIsSubmitting(false);
    }
  }, [visible, initialSelected]);

  // 목록이 로드되면 (이미 선택된 지역이 있으면 그 시/도, 없으면 첫 시/도를) 기본 탭으로 연다.
  React.useEffect(() => {
    if (!groupedOptions || groupedOptions.length === 0) return;
    setActiveSidoName((current) => {
      if (current && groupedOptions.some((g) => g.sidoName === current)) return current;
      const preselectedSidoName = initialSelected[0]?.sidoName;
      return groupedOptions.some((g) => g.sidoName === preselectedSidoName)
        ? preselectedSidoName!
        : groupedOptions[0].sidoName;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedOptions]);

  const isSelected = (region: PreferredRegion) =>
    selected.some((r) => r.sigunguId === region.sigunguId);

  const removeSelected = (region: PreferredRegion) => {
    if (selected.length === 1) {
      Alert.alert(
        '선택 해제',
        `마지막 남은 "${region.sigunguName}"을(를) 해제하시겠어요? 최소 1개는 선택해야 저장할 수 있어요.`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '해제',
            style: 'destructive',
            onPress: () => setSelected(selected.filter((r) => r.sigunguId !== region.sigunguId)),
          },
        ]
      );
      return;
    }
    setSelected(selected.filter((r) => r.sigunguId !== region.sigunguId));
  };

  const toggleLocation = (region: PreferredRegion) => {
    if (isSelected(region)) {
      removeSelected(region);
      return;
    }
    if (selected.length >= MAX_SELECTABLE_LOCATIONS) {
      flashNotice(`지역은 최대 ${MAX_SELECTABLE_LOCATIONS}개까지 선택할 수 있어요.`);
      return;
    }
    setSelected([...selected, region]);
  };

  const activeSigungus = groupedOptions?.find((g) => g.sidoName === activeSidoName)?.sigungus ?? [];
  const trimmedQuery = searchQuery.trim();
  const visibleSigungus = trimmedQuery
    ? activeSigungus.filter((region) => region.sigunguName.includes(trimmedQuery))
    : activeSigungus;

  const handleSelectSido = (sidoName: string) => {
    setActiveSidoName(sidoName);
    setSearchQuery('');
    setIsSidoPickerOpen(false);
  };

  const handleConfirmPress = async () => {
    if (isSubmitting) return;
    if (selected.length === 0) {
      flashNotice('지역을 최소 1개는 선택해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(selected);
      onClose();
    } catch (error) {
      flashNotice(getErrorDisplayMessage(error, '지역 설정에 실패했습니다. 잠시 후 다시 시도해주세요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>지역 설정</Text>
        <Text style={styles.counter}>{selected.length}/{MAX_SELECTABLE_LOCATIONS} 선택됨</Text>
      </View>

      <SelectedRegionsRow selected={selected} maxSelectable={MAX_SELECTABLE_LOCATIONS} onRemove={removeSelected} />

      <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary.electricCyan} />
        </View>
      ) : isError ? (
        <TouchableOpacity
          style={styles.centerState}
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel="지역 목록 다시 조회"
        >
          <Text style={[styles.errorText, { color: colors.state.danger }]}>
            지역 목록을 불러오지 못했습니다. 탭하여 다시 시도해주세요.
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <SidoPicker
            groupedOptions={groupedOptions ?? []}
            activeSidoName={activeSidoName}
            isOpen={isSidoPickerOpen}
            onToggleOpen={() => setIsSidoPickerOpen((open) => !open)}
            onSelectSido={handleSelectSido}
            isRegionSelected={isSelected}
          />

          <RegionSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`${activeSidoName ?? ''} 구/군 검색`}
          />

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {visibleSigungus.length === 0 ? (
              <View style={styles.centerState}>
                <Text style={[styles.errorText, { color: colors.text.muted }]}>검색 결과가 없습니다.</Text>
              </View>
            ) : (
              <View style={styles.chipRow}>
                {visibleSigungus.map((region) => {
                  const selectedState = isSelected(region);
                  const isAtMax = !selectedState && selected.length >= MAX_SELECTABLE_LOCATIONS;
                  return (
                    <TouchableOpacity
                      key={region.sigunguId}
                      onPress={() => toggleLocation(region)}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                        selectedState && styles.chipSelected,
                        isAtMax && styles.chipDisabled,
                      ]}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedState, disabled: isAtMax }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: colors.text.secondary },
                          selectedState && styles.chipTextSelected,
                        ]}
                      >
                        {region.sigunguName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border.primary, marginBottom: 0 }]} />

      <TouchableOpacity
        style={[
          styles.confirmButton,
          { backgroundColor: colors.text.primary },
          (isSubmitting || isError) && styles.confirmButtonDisabled,
        ]}
        onPress={handleConfirmPress}
        disabled={isSubmitting || isError}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="지역 설정 완료"
        accessibilityState={{ disabled: isSubmitting || isError, busy: isSubmitting }}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.background.primary} />
        ) : (
          <Text style={[styles.confirmText, { color: colors.background.primary }]}>설정 완료</Text>
        )}
      </TouchableOpacity>

      <FloatingNotice message={noticeMessage} opacity={noticeOpacity} />
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.lg,
  },
  list: {
    maxHeight: 320,
  },
  centerState: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
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
  chipDisabled: {
    opacity: 0.35,
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
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
