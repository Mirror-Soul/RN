import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function InterviewFooter() {
  const { colors } = useThemeColors();
  return <View style={styles.container}>
    <Text style={[styles.text, { color: colors.text.secondary }]}>
      녹음과 인식된 답변은 서버로 전송되어 트윈 음성과 프로필 생성에 활용돼요.
    </Text>
  </View>;
}
const styles = StyleSheet.create({
  container: { width: '100%', paddingVertical: Spacing.md },
  text: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, textAlign: 'center' },
});
