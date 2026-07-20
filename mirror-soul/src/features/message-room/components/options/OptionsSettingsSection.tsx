import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { AnimatedSwitch } from '@/src/components/common/AnimatedSwitch';

export function OptionsSettingsSection() {
  const [notifEnabled, setNotifEnabled] = useState(true);

  return (
    <View style={styles.menuSection}>
      <Text style={styles.sectionLabel}>SETTINGS</Text>

      {/* 알림 설정 */}
      <View style={styles.menuItemMargin}>
        <View style={[styles.menuItem, styles.menuItemRow]}>
          <View style={styles.menuItemLeft}>
            <Feather name="bell" size={16} color={Colors.neutral.lightGray} />
            <Text style={styles.menuItemText}>알림 설정</Text>
          </View>
          <View style={styles.toggleWrapper}>
            <AnimatedSwitch value={notifEnabled} onToggle={() => setNotifEnabled((v) => !v)} />
          </View>
        </View>
      </View>

      {/* 시간 채우기 (선물) */}
      <View style={styles.menuItemMarginSm}>
        <Pressable style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Feather name="gift" size={16} color={Colors.neutral.lightGray} />
            <Text style={styles.menuItemText}>시간 채우기 (선물)</Text>
          </View>
        </Pressable>
      </View>

      {/* 프로필 상세보기 */}
      <View style={styles.menuItemMarginSm}>
        <Pressable style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Feather name="user" size={16} color={Colors.neutral.lightGray} />
            <Text style={styles.menuItemText}>프로필 상세보기</Text>
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
  menuItemRow: {
    // space-between
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: Colors.neutral.lightGrayText,
  },
  toggleWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
