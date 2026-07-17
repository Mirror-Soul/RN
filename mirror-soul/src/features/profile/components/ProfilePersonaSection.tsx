import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ProfilePersonaSectionProps {
  tags: string[];
  delay?: number;
}

export const ProfilePersonaSection = ({
  tags,
  delay = 120,
}: ProfilePersonaSectionProps) => {
  const { colors } = useThemeColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(550).springify()}
      style={styles.container}
    >
      {/* 섹션 헤딩 */}
      <View style={styles.headingRow}>
        <Text style={[styles.headingText, { color: colors.text.muted }]}>Persona Analysis</Text>
        <Feather
          name="activity"
          size={16}
          color="rgba(0, 211, 242, 0.5)"
        />
      </View>

      {/* 가로 스크롤 태그 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagScrollContent}
      >
        {tags.map((tag, index) => (
          <LinearGradient
            key={index}
            colors={[
              'rgba(0, 211, 243, 0.1)',
              'rgba(173, 70, 255, 0.1)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tagBadge, { borderColor: colors.border.primary }]}
          >
            <Text style={[styles.tagText, { color: colors.text.primary }]}>#{tag}</Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxl,
  },

  // 헤딩
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headingText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 2.12,
    textTransform: 'uppercase',
  },

  // 태그
  tagScrollContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.xs, // 마지막 태그가 잘리지 않도록
  },
  tagBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1,
    // shadow glow
    shadowColor: 'rgba(34, 211, 238, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
  },
  tagText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
});
