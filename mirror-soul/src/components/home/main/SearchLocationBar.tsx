import LocationIcon from '@/assets/images/common/Location.svg';
import RightNarrowIcon from '@/assets/images/common/Right_narrow.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface SearchLocationBarProps {
  locations?: string[];
  onPress?: () => void;
}

/**
 * SearchLocationBar 컴포넌트 (SRP)
 * 선택된 지역 태그 칩과 우측 화살표 버튼을 렌더링합니다.
 */
export default function SearchLocationBar({
  locations = ['강동구', '강북구'],
  onPress,
}: SearchLocationBarProps) {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="지역 검색 변경"
    >
      <View style={styles.leftSection}>
        <LocationIcon width={16} height={16} />
        <View style={styles.tagRow}>
          {locations.map((loc) => (
            <View key={loc} style={styles.tag}>
              <Text style={styles.tagText}>{loc}</Text>
            </View>
          ))}
        </View>
      </View>
      <RightNarrowIcon width={16} height={16} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tag: {
    height: 20,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan10_d3,
  },
  tagText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
    textAlign: 'center',
  },
});
