import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, FontFamily, Radii, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface DiscoveryActionFooterProps {
  onPass: () => void;
  onConnect: () => void;
}

/**
 * DiscoveryActionFooter 컴포넌트 (SRP)
 * 발견 탭 카드 밖의 패스/통화하기 액션 푸터 — 매칭 탭 MatchingFooter.tsx와 톤을 통일한다.
 */
export default function DiscoveryActionFooter({ onPass, onConnect }: DiscoveryActionFooterProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* 패스 버튼 */}
      <Pressable
        onPress={onPass}
        style={[styles.buttonSecondary, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        accessibilityRole="button"
        accessibilityLabel="패스"
      >
        <Ionicons name="close-outline" size={24} color={colors.text.secondary} style={styles.iconMargin} />
        <Text style={[styles.textSecondary, { color: colors.text.secondary }]}>패스</Text>
      </Pressable>

      {/* 통화하기 버튼 */}
      <Pressable
        style={styles.buttonPrimaryContainer}
        onPress={onConnect}
        accessibilityRole="button"
        accessibilityLabel="통화하기"
      >
        <LinearGradient
          colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonPrimary}
        >
          <Ionicons name="call-outline" size={20} color={Colors.primary.soulBlack} style={styles.iconMargin} />
          <Text style={styles.textPrimary}>통화하기</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    height: 80,
  },
  buttonSecondary: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimaryContainer: {
    flex: 1,
    height: 80,
    borderRadius: Radii.xxl,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 35,
    elevation: 5,
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: Spacing.sm,
  },
  textSecondary: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  textPrimary: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    color: Colors.primary.soulBlack,
    letterSpacing: 1.1,
  },
});
