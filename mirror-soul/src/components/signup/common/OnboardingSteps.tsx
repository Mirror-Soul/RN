import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Circle, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';

const STEPS = [
  { id: 1, label: '계정 설정' },
  { id: 2, label: '프로필 설정' },
  { id: 3, label: '자기 소개' },
  { id: 4, label: '인터뷰' },
  { id: 5, label: '얼굴 인식' },
];

interface OnboardingStepsProps {
  currentStep?: number;
}

/**
 * 회원가입 상단 스텝 진행도 인디케이터
 */
export default function OnboardingSteps({ currentStep = 1 }: OnboardingStepsProps) {
  return (
    <View style={styles.container}>
      {STEPS.map((step) => {
        const isActive = step.id <= currentStep;
        
        return (
          <View key={step.id} style={styles.stepContainer}>
            {/* Circle Wrapper (Placed ABOVE text) */}
            <View style={styles.circleWrapper}>
              {/* Background Glow (Outer blur substitute) */}
              <View style={[styles.glowContainer, { opacity: isActive ? 0.8 : 0.3324 }]}>
                 <Svg height="44" width="44" viewBox="0 0 44 44">
                   <Defs>
                     <SvgRadialGradient id={`glow-${step.id}`} cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                       <Stop offset="0%" stopColor={Colors.primary.electricCyan} stopOpacity="0.5" />
                       <Stop offset="100%" stopColor={Colors.primary.vividPurple} stopOpacity="0" />
                     </SvgRadialGradient>
                   </Defs>
                   <Circle cx="22" cy="22" r="22" fill={`url(#glow-${step.id})`} />
                 </Svg>
              </View>

              {/* Inner Circle (40x40 with border) */}
              <View style={[
                styles.innerCircle, 
                !isActive && { 
                  borderColor: Colors.glass.white20, 
                  backgroundColor: Colors.glass.white5,
                  shadowOpacity: 0 // Optional: remove glow shadow for inactive
                }
              ]}>
                {isActive && (
                  <LinearGradient
                    colors={['rgba(0, 211, 243, 0.20)', 'rgba(194, 122, 255, 0.20)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <Text style={[styles.stepNumber, !isActive && { color: Colors.neutral.darkGray }]}>
                  {step.id}
                </Text>
              </View>
            </View>

            {/* Label (Placed BELOW the circle) */}
            <View style={styles.labelContainer}>
              <Text style={[styles.labelText, !isActive && { color: Colors.neutral.disabledText }]}>
                {step.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 64,
  },
  stepContainer: {
    alignItems: 'center',
    gap: 8,
    width: 60,
  },
  labelContainer: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    color: Colors.primary.electricCyan,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  circleWrapper: {
    width: 44, 
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 44,
    height: 44,
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.836,
    borderColor: Colors.primary.electricCyan,
    overflow: 'hidden', 
    justifyContent: 'center',
    alignItems: 'center',
    // fallback native shadow for extra glow
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  stepNumber: {
    color: Colors.primary.electricCyan,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
