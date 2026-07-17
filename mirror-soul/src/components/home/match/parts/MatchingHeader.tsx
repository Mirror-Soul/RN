import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function MatchingHeader() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* 타이틀 */}
      <Text style={[styles.title, { color: colors.text.primary }]}>Matching</Text>

      {/* 오른쪽 아이콘 버튼 (ex. 필터 또는 설정) */}
      <Pressable style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <Ionicons name="options-outline" size={20} color={colors.text.secondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    marginTop: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xxxl,
    letterSpacing: -1.1,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
});
