import CompleteIcon from '@/assets/images/common/Complete.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step1';
import { logger } from '@/src/utils/logger';

interface AgreementRowProps {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}

function AgreementRow({ checked, onToggle, accessibilityLabel, children }: AgreementRowProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.checkboxWrapper}
        onPress={onToggle}
        activeOpacity={0.8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel}
      >
        {checked ? (
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

      <View style={styles.textContainer}>{children}</View>
    </View>
  );
}

/**
 * AgreementSection 컴포넌트 (SRP)
 *
 * 두 종류의 동의를 각각 독립된 체크박스로 분리한다:
 * 1. 서비스 이용약관 및 개인정보 처리방침 (일반 동의)
 * 2. 얼굴 영상·음성 등 생체정보 수집 및 AI 트윈 생성·활용 동의 (민감정보 별도 동의)
 *
 * 개인정보보호법 제23조는 생체정보 같은 민감정보 처리에 별도 동의를 요구하므로,
 * 하나의 체크박스에 묶어서는 안 된다.
 */
export default function AgreementSection({ state, onChange }: SectionProps) {
  const toggleTerms = () => onChange({ agreedToTerms: !state.agreedToTerms });
  const toggleBiometric = () => onChange({ agreedToBiometricData: !state.agreedToBiometricData });

  return (
    <View style={styles.container}>
      <AgreementRow
        checked={state.agreedToTerms}
        onToggle={toggleTerms}
        accessibilityLabel="서비스 이용약관 및 개인정보 처리방침에 동의"
      >
        <Text style={styles.baseText}>
          <Text
            style={styles.link}
            onPress={() => logger.debug('Terms')}
            accessibilityRole="link"
            accessibilityLabel="서비스 이용약관 보기"
          >
            서비스 이용약관
          </Text>
          <Text style={styles.baseText}> 및 </Text>
          <Text
            style={styles.link}
            onPress={() => logger.debug('Privacy')}
            accessibilityRole="link"
            accessibilityLabel="개인정보 처리방침 보기"
          >
            개인정보 처리방침
          </Text>
          <Text style={styles.baseText}>에 동의합니다. (필수)</Text>
        </Text>
      </AgreementRow>

      <AgreementRow
        checked={state.agreedToBiometricData}
        onToggle={toggleBiometric}
        accessibilityLabel="생체정보 수집 및 AI 트윈 생성·활용 동의"
      >
        <Text style={styles.baseText}>
          얼굴 영상, 음성 등{' '}
          <Text style={styles.emphasisText}>생체정보 수집 및 이를 이용한 AI 트윈 생성·활용</Text>에
          동의합니다. 다른 사용자는 회원님의 AI 트윈과 통화할 수 있습니다. (필수)
        </Text>
      </AgreementRow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
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
  emphasisText: {
    color: Colors.neutral.pureWhite,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  link: {
    color: Colors.primary.electricCyan,
    textDecorationLine: 'underline',
  },
});
