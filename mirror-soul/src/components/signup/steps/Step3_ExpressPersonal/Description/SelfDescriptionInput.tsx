import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SelfDescriptionInput({ value, onChangeText }: Props) {
  const { colors } = useThemeColors();
  const charCount = value.length;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>자신을 소개해주세요.</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholder="저는 말이죠.."
          placeholderTextColor={colors.text.muted}
          multiline
          maxLength={160}
          value={value}
          onChangeText={onChangeText}
          textAlignVertical="top"
        />
      </View>

      <Text style={[styles.countText, { color: colors.text.muted }]}>{charCount} 자</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.439,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    width: '100%',
    height: 121,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    lineHeight: 24,
    letterSpacing: -0.312,
    padding: Spacing.none, // Reset default padding
  },
  countText: {
    fontSize: FontSize.sm,
    textAlign: 'left',
  }
});
