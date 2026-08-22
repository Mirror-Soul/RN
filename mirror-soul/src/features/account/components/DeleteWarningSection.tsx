import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

export const DeleteWarningSection = () => {
  const { colors } = useThemeColors();

  return (
    <Animated.View 
      entering={FadeInDown.delay(100).duration(500).springify()}
      style={styles.container}
    >
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <Feather name="alert-triangle" size={24} color={Colors.primary.recordingRed} />
        </View>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          정말 떠나시나요?
        </Text>
      </View>

      <View style={[styles.warningBox, { backgroundColor: 'rgba(251, 44, 54, 0.05)', borderColor: 'rgba(251, 44, 54, 0.15)' }]}>
        <Text style={[styles.warningText, { color: 'rgba(248, 113, 113, 0.9)' }]}>
          탈퇴를 진행하시면 계정이 즉시 <Text style={styles.boldText}>비활성화(Soft Delete)</Text>되며, <Text style={styles.boldText}>30일의 유예 기간</Text>이 주어집니다.{'\n\n'}
          유예 기간 내에는 로그인하여 계정을 복구할 수 있으나, <Text style={styles.boldText}>30일이 경과하면 이름, 이메일 등 개인 정보가 비식별 처리되어 더 이상 본인 확인이 불가능</Text>해집니다.
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.giant,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(251, 44, 54, 0.1)',
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xxl,
    letterSpacing: -0.45,
  },
  warningBox: {
    padding: Spacing.xl,
    borderWidth: 0.61,
    borderRadius: Radii.lg,
  },
  warningText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 23,
    letterSpacing: -0.15,
  },
  boldText: {
    fontWeight: FontWeight.semibold,
    color: Colors.primary.activeRedText,
  },
});
