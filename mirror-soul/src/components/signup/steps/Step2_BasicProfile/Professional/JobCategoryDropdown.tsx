import {Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jobCategories } from './jobData';
import SelectDropdownModal, { DropdownAnchor } from '@/src/components/signup/common/SelectDropdownModal';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  onSelect: (category: string) => void;
  onClose: () => void;
  anchor: DropdownAnchor;
}

export default function JobCategoryDropdown({ onSelect, onClose, anchor }: Props) {
  const { colors } = useThemeColors();

  const handleSelect = (job: string) => {
    onSelect(job);
    onClose(); // 선택 완료 후 명시적으로 닫기 호출
  };

  return (
    <SelectDropdownModal onClose={onClose} anchor={anchor} panelStyle={styles.dropdownPanel}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {jobCategories.map((job) => (
          <TouchableOpacity
            key={job.value}
            style={styles.listItem}
            activeOpacity={0.6}
            onPress={() => handleSelect(job.value)}
          >
            <Text style={[styles.listItemText, { color: colors.text.primary }]}>{job.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SelectDropdownModal>
  );
}

const styles = StyleSheet.create({
  dropdownPanel: {
    maxHeight: 240,
    padding: 8.607,
  },
  scrollContent: {
    flexGrow: 1,
    gap: Spacing.xs,
  },
  listItem: {
    width: '100%',
    height: 48,
    paddingVertical: 11.4,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md2,
    justifyContent: 'center',
  },
  listItemText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    letterSpacing: -0.312,
  }
});
