import GreenCheckIcon from '@/assets/images/common/Green_check.svg';
import ProtectIcon from '@/assets/images/common/Verification_protect_icon.svg';
import { Colors } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Step1State } from '../types/step1';

interface IdentityVerificationSectionProps {
  state: Step1State;
  onVerify: () => void;
}

/**
 * IdentityVerificationSection 컴포넌트 (SRP)
 * PASS 본인인증 버튼 및 완료 상태를 관리합니다.
 */
export default function IdentityVerificationSection({ state, onVerify }: IdentityVerificationSectionProps) {
  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.heading}>
        <ProtectIcon width={24} height={24} />
        <Text style={styles.headingTitle}>본인인증</Text>
      </View>

      {!state.isIdentityVerified ? (
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={onVerify}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#2B7FFF', '#155DFC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>PASS 본인인증</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <GreenCheckIcon width={20} height={20} />
          </View>
          <View style={styles.successTextCol}>
            <Text style={styles.successTitle}>본인인증 완료</Text>
            <Text style={styles.successSubtitle}>인증이 완료되었습니다</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 344.94,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    alignSelf: 'stretch',
  },
  heading: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7.995,
    paddingRight: 258.949,
    alignSelf: 'stretch',
  },
  headingTitle: {
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  verifyButton: {
    height: 55.992,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 108.627,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  successBox: {
    height: 73.215,
    paddingLeft: 15.999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: 'rgba(0, 201, 80, 0.30)',
    backgroundColor: 'rgba(0, 201, 80, 0.10)',
    alignSelf: 'stretch',
  },

  iconCircle: {
    width: 39.993,
    height: 39.993,
    borderRadius: 9999, // Pill 형태
    backgroundColor: 'rgba(0, 201, 80, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTextCol: {
    flex: 1,
    height: 37.994,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1.999,
  },
  successTitle: {
    color: Colors.primary.successGreen,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  successSubtitle: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
