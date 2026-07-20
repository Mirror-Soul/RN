import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

export function OptionsDangerSection() {
  return (
    <View style={[styles.menuSection, styles.dangerSection]}>
      <Text style={styles.sectionLabel}>DANGER ZONE</Text>

      {/* 대화 내용 삭제 */}
      <View style={styles.menuItemMargin}>
        <Pressable style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Feather name="trash-2" size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.dangerItemText}>대화 내용 삭제</Text>
          </View>
        </Pressable>
      </View>

      {/* 차단하기 */}
      <View style={styles.menuItemMarginSm}>
        <Pressable style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="ban-outline" size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.dangerItemText}>차단하기</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    alignSelf: 'stretch',
  },
  dangerSection: {
    marginTop: Spacing.xxxl,
  },
  sectionLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: Colors.neutral.disabledText,
    paddingHorizontal: Spacing.sm,
  },
  menuItemMargin: {
    paddingTop: Spacing.md,
    alignSelf: 'stretch',
  },
  menuItemMarginSm: {
    paddingTop: Spacing.xs,
    alignSelf: 'stretch',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignSelf: 'stretch',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dangerItemText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: Colors.neutral.lightGray,
  },
});
