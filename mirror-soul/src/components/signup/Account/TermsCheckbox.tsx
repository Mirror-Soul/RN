import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TermsCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

/**
 * 이용약관 동의 체크박스 컴포넌트
 */
export default function TermsCheckbox({ checked, onToggle }: TermsCheckboxProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={[styles.checkbox, checked && styles.checkboxActive]}
      >
        {checked && <View style={styles.checkInner} />}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.baseText}>
          <Text style={styles.link1} onPress={() => console.log('Terms clicked')}>서비스 이용약관</Text>
          <Text style={styles.baseText}> 및 </Text>
          <Text style={styles.link2} onPress={() => console.log('Privacy clicked')}>개인정보 처리방침</Text>
          <Text style={styles.baseText}>에 동의합니다.</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16.6,
    paddingTop: 16.6,
    paddingBottom: 16.6, // Adjusted slightly from 0.612 to be vertically balanced
    borderRadius: 16,
    borderWidth: 0.6,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.8,
    borderColor: Colors.glass.white30,
    backgroundColor: Colors.glass.white5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary.electricCyan,
    borderColor: Colors.primary.electricCyan,
  },
  checkInner: {
    width: 10,
    height: 10,
    backgroundColor: Colors.primary.soulBlack,
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  baseText: {
    color: Colors.neutral.lightGrayText,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19.5,
  },
  link1: {
    color: Colors.primary.electricCyan,
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  link2: {
    color: Colors.primary.vividPurple,
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  }
});
