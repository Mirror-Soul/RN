import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Radii } from '@/src/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SelfDescriptionInput({ value, onChangeText }: Props) {
  const charCount = value.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>자신을 소개해주세요.</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="저는 말이죠.."
          placeholderTextColor="#6A7282"
          multiline
          maxLength={160}
          value={value}
          onChangeText={onChangeText}
          textAlignVertical="top"
        />
      </View>

      <Text style={styles.countText}>{charCount} 자</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
    marginBottom: 4,
  },
  inputWrapper: {
    width: '100%',
    height: 121,
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.312,
    padding: 0, // Reset default padding
  },
  countText: {
    color: '#6A7282',
    fontSize: 12,
    textAlign: 'left',
  }
});
