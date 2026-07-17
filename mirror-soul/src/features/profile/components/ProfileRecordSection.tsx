import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, FontFamily } from '@/src/constants/theme';

interface ProfileRecordSectionProps {
  bio: string;
  delay?: number;
}

export const ProfileRecordSection = ({
  bio,
  delay = 280,
}: ProfileRecordSectionProps) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(550).springify()}
      style={styles.container}
    >
      {/* 섹션 헤딩 + 구분선 */}
      <View style={styles.headingRow}>
        <Text style={styles.headingText}>나의 기록</Text>
        <View style={styles.divider} />
      </View>

      {/* 자기소개 카드 */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.03)',
          'rgba(0, 0, 0, 0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.bioText}>{bio}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  // 헤딩 + 구분선
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headingText: {
    fontFamily: FontFamily.sans,
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 2.12,
    textTransform: 'uppercase',
    color: Colors.neutral.disabledText,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glass.white5,
  },

  // 자기소개 카드
  card: {
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.glass.white5,
    borderRadius: 32,
  },
  bioText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: -0.44,
    color: Colors.neutral.softWhite,
  },
});
