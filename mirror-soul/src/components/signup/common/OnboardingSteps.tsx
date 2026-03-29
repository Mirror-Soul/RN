import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Circle, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';
import CompleteIcon from '@/assets/images/common/Complete.svg';

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

// 화면 사이즈를 계산하여 작은 다바이스(가로 360px 이하)에서는 일관된 작은 폰트를 적용
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DYNAMIC_FONT_SIZE = SCREEN_WIDTH <= 360 ? 10 : 12;

/**
 * 회원가입 상단 스텝 진행도 인디케이터
 */
export default function OnboardingSteps({ currentStep = 1 }: OnboardingStepsProps) {
  return (
    <View style={styles.container}>
      {STEPS.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        
        return (
          <View key={step.id} style={styles.stepContainer}>
            {/* Circle Wrapper (Placed ABOVE text) */}
            <View style={styles.circleWrapper}>
              
              {/* Glow Effect only for Active or Completed */}
              {(isActive || isCompleted) && (
                <View style={[styles.glowContainer, { opacity: isCompleted ? 0.3324 : 0.8 }]}>
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
              )}

              {/* Inner Circle */}
              <View style={[
                styles.innerCircle, 
                // 비활성(Inactive) 상태
                (!isActive && !isCompleted) && { 
                  borderColor: Colors.glass.white20, 
                  backgroundColor: Colors.glass.white5,
                  shadowOpacity: 0
                },
                // 완료(Completed) 상태: 보더 라인 없음, 꽉찬 LinearBackground
                isCompleted && {
                  borderWidth: 0,
                  shadowOpacity: 0,
                }
              ]}>
                
                {/* 배경 컬러 렌더링 */}
                {(isActive || isCompleted) && (
                  <LinearGradient
                    colors={isCompleted ? Colors.gradient.cyanToPurple : [Colors.glass.cyan20, Colors.glass.purple20]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                
                {/* 텍스트 또는 완료 아이콘 렌더링 */}
                {isCompleted ? (
                   <CompleteIcon width={20} height={20} />
                ) : (
                  <Text style={[
                      styles.stepNumber, 
                      !isActive && { color: Colors.neutral.darkGray },
                      isActive && { color: Colors.primary.electricCyan }
                    ]}
                  >
                    {step.id}
                  </Text>
                )}
              </View>
            </View>

            {/* Label (Placed BELOW the circle) */}
            <View style={styles.labelContainer}>
              <Text style={[
                  styles.labelText, 
                  { fontSize: DYNAMIC_FONT_SIZE }, // Apply dynamic font size
                  (!isActive && !isCompleted) && { color: Colors.neutral.disabledText },
                  isActive && { color: Colors.primary.electricCyan },
                  isCompleted && { color: Colors.neutral.lightGray }
                ]}
                numberOfLines={1}
              >
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
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
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
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});

