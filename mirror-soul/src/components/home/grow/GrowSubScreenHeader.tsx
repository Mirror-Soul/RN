import BackIcon from '@/assets/images/common/back.svg';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface GrowSubScreenHeaderProps {
  title: string;
}

/**
 * 성장 탭 하위 캡처 화면(목소리/얼굴 데이터 업데이트) 공통 헤더 (SRP)
 * 뒤로가기 버튼 + 중앙 타이틀만 다르고 나머지 구조가 동일해서 화면별 헤더로 중복 두지 않는다.
 */
export default function GrowSubScreenHeader({ title }: GrowSubScreenHeaderProps) {
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
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
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
