import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';
import { SectionProps } from '../types/step1';
import CompleteIcon from '@/assets/images/common/Complete.svg';

/**
 * AgreementSection 컴포넌트 (SRP)
 * 서비스 이용약관 및 개인정보 처리방침 동의 세션을 관리합니다.
 */
export default function AgreementSection({ state, onChange }: SectionProps) {
  const toggleAgreed = () => {
    onChange({ agreedToTerms: !state.agreedToTerms });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.checkboxWrapper} 
        onPress={toggleAgreed}
        activeOpacity={0.8}
      >
        {state.agreedToTerms ? (
          <LinearGradient
            colors={['#00D3F3', '#C27AFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCheck}
          >
            <CompleteIcon width={12} height={12} />
          </LinearGradient>
        ) : (
          <View style={styles.emptyCheck} />
        )}
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.baseText}>
          <Text style={styles.link} onPress={() => console.log('Terms')}>서비스 이용약관</Text>
          <Text style={styles.baseText}> 및 </Text>
          <Text style={styles.link} onPress={() => console.log('Privacy')}>개인정보 처리방침</Text>
          <Text style={styles.baseText}>에 동의합니다.</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52, // Approx for vertical alignment
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  checkboxWrapper: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gradientCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCheck: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
  },
  baseText: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  link: {
    color: Colors.primary.electricCyan,
    textDecorationLine: 'underline',
  },
});
