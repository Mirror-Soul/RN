import BackIcon from '@/assets/images/common/back.svg';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 얼굴 데이터 캡처 헤더 (SRP)
 * VoiceUpdateHeader와 동일한 구조 — 뒤로가기 버튼 + 중앙 타이틀.
 */
export default function FaceDataHeader() {
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="뒤로가기"
        accessibilityRole="button"
      >
        <BackIcon width={24} height={24} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>얼굴 데이터 업데이트</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: Spacing.sm,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.none,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.449,
  },
});
