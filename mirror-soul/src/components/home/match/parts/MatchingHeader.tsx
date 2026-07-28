import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';

export default function MatchingHeader() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* 좌측 여백 (우측 아이콘과 대칭을 맞춰 타이틀을 중앙 정렬) */}
      <View style={{ width: 44 }} />

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
  container: tabHeaderStyles.container,
  title: tabHeaderStyles.title,
  iconButton: tabHeaderStyles.iconButton,
});
