import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';

interface MatchingHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function MatchingHeader({ onRefresh, isRefreshing }: MatchingHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* 좌측 여백 (우측 아이콘과 대칭을 맞춰 타이틀을 중앙 정렬) */}
      <View style={{ width: 44 }} />

      {/* 타이틀 */}
      <Text style={[styles.title, { color: colors.text.primary }]}>Matching</Text>

      {/* 수신자가 화면을 떠나지 않고 새 만남 신청을 다시 조회할 수 있는 명시적 새로고침 버튼 */}
      <Pressable
        onPress={onRefresh}
        disabled={isRefreshing}
        accessibilityRole="button"
        accessibilityLabel="만남 신청 목록 새로고침"
        accessibilityState={{ busy: isRefreshing, disabled: isRefreshing }}
        style={({ pressed }) => [
          styles.iconButton,
          { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
          (pressed || isRefreshing) && styles.iconButtonPressed,
        ]}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color={colors.text.secondary} />
        ) : (
          <Ionicons name="refresh-outline" size={20} color={colors.text.secondary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: tabHeaderStyles.container,
  title: tabHeaderStyles.title,
  iconButton: tabHeaderStyles.iconButton,
  iconButtonPressed: {
    opacity: 0.55,
  },
});
