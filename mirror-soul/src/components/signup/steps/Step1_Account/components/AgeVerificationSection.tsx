import { Colors, FontFamily, FontSize, FontWeight } from '@/src/constants/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionProps } from '../types/step1';
import { ConsentDetailSheet } from '@/src/components/common/ConsentDetailSheet';
import { AGE_VERIFICATION_CONTENT } from '@/src/constants/consentContent';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import SignupConsentRow from '@/src/components/signup/common/SignupConsentRow';

/**
 * AgeVerificationSection 컴포넌트 (SRP)
 *
 * 실제 PASS 본인인증 연동 전까지의 임시 조치로, 만 19세 이상 여부를
 * 사용자 자가 선언으로 받는다. 실명 확인은 아니지만, 미성년자 보호를
 * 위한 최소한의 장치로 실제 PASS 연동 시점까지 유지한다.
 *
 * "보기"를 누르면 왜 연령 확인이 필요한지, 현재는 자가 신고 방식이라는 점,
 * 허위 기재 시 불이익을 바텀시트로 보여준다 — 체크박스만 누르게 하면
 * 무엇에 동의하는지 모른 채 누르게 된다.
 */
export default function AgeVerificationSection({ state, onChange }: SectionProps) {
  const { colors } = useThemeColors();
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const toggleAdultConfirmed = () => {
    onChange({ isAdultConfirmed: !state.isAdultConfirmed });
  };

  return (
    <View>
      <SignupConsentRow checked={state.isAdultConfirmed} onToggle={toggleAdultConfirmed} accessibilityLabel="만 19세 이상 확인"
        onViewDetail={() => setIsDetailVisible(true)} viewDetailLabel="연령 확인 안내 자세히 보기"
        detail={<Text style={[styles.viewDetailText, { color: colors.brand.accent }]}>보기</Text>}>
        <Text style={[styles.baseText, { color: colors.text.primary }]}>만 19세 이상이에요. (필수)</Text>
      </SignupConsentRow>

      <ConsentDetailSheet
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
        onConfirm={() => onChange({ isAdultConfirmed: true })}
        title="연령 확인 안내"
        content={AGE_VERIFICATION_CONTENT}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  baseText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.regular, lineHeight: 22 },
  viewDetailText: { color: Colors.primary.electricCyan, fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.medium, lineHeight: 18, textDecorationLine: 'underline' },
});
