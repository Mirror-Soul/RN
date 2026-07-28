import CompleteIcon from '@/assets/images/common/Complete.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step1';

/**
 * AgeVerificationSection 컴포넌트 (SRP)
 *
 * 실제 PASS 본인인증 연동 전까지의 임시 조치로, 만 19세 이상 여부를
 * 사용자 자가 선언으로 받는다. 실명 확인은 아니지만, 미성년자 보호를
 * 위한 최소한의 장치로 실제 PASS 연동 시점까지 유지한다.
 */
export default function AgeVerificationSection({ state, onChange }: SectionProps) {
  const toggleAdultConfirmed = () => {
    onChange({ isAdultConfirmed: !state.isAdultConfirmed });
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.checkboxWrapper}
        onPress={toggleAdultConfirmed}
        activeOpacity={0.8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: state.isAdultConfirmed }}
        accessibilityLabel="만 19세 이상 확인"
      >
        {state.isAdultConfirmed ? (
          <LinearGradient
            colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
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
          만 19세 이상이며, 본 서비스 이용 자격을 충족합니다. (필수)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
  checkboxWrapper: {
    width: 20,
    height: 20,
    borderRadius: Radii.xs,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glass.white5,
    marginTop: 2,
  },
  gradientCheck: {
    width: 20,
    height: 20,
    borderRadius: Radii.xs,
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
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  },
});
