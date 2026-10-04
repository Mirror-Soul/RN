import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import FormLabel from '@/src/components/signup/common/FormLabel';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { SectionProps } from '../types/step2';
import { SIGNUP_KEYBOARD_ACCESSORY_ID } from '@/src/components/signup/common/SignupFormScreen';

interface Props extends SectionProps { onCheck: () => void; isChecking: boolean }
export default function NicknameSection({ state, onChange, onCheck, isChecking }: Props) {
  const { colors } = useThemeColors();
  const [focused, setFocused] = useState(false);
  const disabled = isChecking || state.nickname.trim().length < 2 || state.isNicknameVerified;
  return <View style={styles.container}>
    <FormLabel label="닉네임" optional={false} />
    <TextInput accessibilityLabel="상대에게 보여줄 닉네임" style={[styles.input, { color: colors.text.primary, backgroundColor: colors.background.glass, borderColor: focused ? colors.brand.accent : colors.border.primary }]}
      value={state.nickname} onChangeText={nickname => onChange({ nickname, isNicknameVerified: false })} placeholder="2자 이상 입력해주세요" placeholderTextColor={colors.text.muted}
      inputAccessoryViewID={Platform.OS === 'ios' ? SIGNUP_KEYBOARD_ACCESSORY_ID : undefined} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()}
      autoCapitalize="none" autoCorrect={false} editable={!isChecking} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    <View style={styles.actions}>
      <View style={styles.message}>
        {state.isNicknameVerified && <Feather name="check-circle" size={16} color={colors.state.success} />}
        <Text accessibilityLiveRegion="polite" style={[styles.hint, { color: state.isNicknameVerified ? colors.state.success : colors.text.secondary }]}>{state.isNicknameVerified ? '사용할 수 있는 닉네임이에요.' : '다른 회원에게 이 이름으로 보여요.'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="닉네임 중복 확인" accessibilityState={{ disabled, busy: isChecking }} disabled={disabled} onPress={onCheck}
        style={[styles.button, { borderColor: disabled ? colors.border.primary : colors.brand.accent }]}>
        {isChecking ? <ActivityIndicator size="small" color={colors.brand.accent} /> : <Text style={[styles.buttonText, { color: disabled ? colors.text.secondary : colors.brand.accent }]}>{state.isNicknameVerified ? '확인 완료' : '중복 확인'}</Text>}
      </Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  input: { minHeight: 52, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radii.md, borderWidth: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  message: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexShrink: 1 },
  hint: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, flexShrink: 1 },
  button: { minHeight: 44, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.md, borderWidth: 1, justifyContent: 'center' },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
});
