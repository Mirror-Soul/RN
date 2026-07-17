import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// SVG 파일을 컴포넌트로 활용
import ProtectIcon from "@/assets/images/common/Protect.svg";
import {Colors, FontSize, FontWeight} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 하단 보안 알림 렌더링 컴포넌트
 */
export default function SecurityFooter() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <ProtectIcon width={18} height={18} />
      <Text style={[styles.text, { color: colors.text.muted }]}>Your soul data is encrypted on-device</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6.5,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
  }
});
