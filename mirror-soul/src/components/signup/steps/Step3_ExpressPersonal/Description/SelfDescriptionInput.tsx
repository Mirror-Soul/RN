import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import FormLabel from '@/src/components/signup/common/FormLabel';
import SignupSection from '@/src/components/signup/common/SignupSection';
import { SIGNUP_KEYBOARD_ACCESSORY_ID } from '@/src/components/signup/common/SignupFormScreen';

export default function SelfDescriptionInput({ value, onChangeText, disabled = false }: { value: string; onChangeText: (text: string) => void; disabled?: boolean }) {
  const { colors } = useThemeColors();
  return <SignupSection title="나를 소개하는 한두 문장" description="좋아하는 것, 주말의 모습, 함께 해보고 싶은 일을 편하게 적어주세요.">
    <FormLabel label="상대에게 보이는 소개" optional={false} />
    <TextInput accessibilityLabel="상대에게 보이는 자기소개" multiline maxLength={160} value={value} onChangeText={onChangeText} editable={!disabled} textAlignVertical="top"
      inputAccessoryViewID={Platform.OS === 'ios' ? SIGNUP_KEYBOARD_ACCESSORY_ID : undefined}
      placeholder="예: 주말에는 동네 카페를 찾아다녀요. 서로의 취향을 나누는 대화가 좋아요." placeholderTextColor={colors.text.muted}
      style={[styles.input, { color: colors.text.primary, backgroundColor: colors.background.glass, borderColor: colors.border.primary }]} />
    <View style={styles.footer}>
      <Text style={[styles.copy, { color: colors.text.secondary, flex: 1 }]}>다른 회원에게 공개되는 소개예요.</Text>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{value.length} / 160자</Text>
    </View>
  </SignupSection>;
}
const styles = StyleSheet.create({
  input: { minHeight: 128, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 26 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
});
