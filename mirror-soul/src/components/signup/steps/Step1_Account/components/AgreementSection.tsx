import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionProps } from '../types/step1';
import { ConsentDetailSheet } from '@/src/components/common/ConsentDetailSheet';
import {
  TERMS_OF_SERVICE_CONTENT,
  PRIVACY_POLICY_CONTENT,
  BIOMETRIC_CONSENT_CONTENT,
  MARKETING_CONSENT_CONTENT,
} from '@/src/constants/consentContent';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import SignupConsentRow from '@/src/components/signup/common/SignupConsentRow';

type ConsentSheetKey = 'terms' | 'privacy' | 'biometric' | 'marketing';

const SHEET_CONTENT: Record<ConsentSheetKey, { title: string; content: string }> = {
  terms: { title: '서비스 이용약관', content: TERMS_OF_SERVICE_CONTENT },
  privacy: { title: '개인정보 처리방침', content: PRIVACY_POLICY_CONTENT },
  biometric: { title: '생체정보 수집 및 AI 트윈 활용 동의', content: BIOMETRIC_CONSENT_CONTENT },
  marketing: { title: '마케팅 정보 수신 동의', content: MARKETING_CONSENT_CONTENT },
};

/**
 * AgreementSection 컴포넌트 (SRP)
 *
 * 동의 항목 (각각 별도 체크박스 + "보기" 상세 시트):
 * 1. 서비스 이용약관 동의 (필수)
 * 2. 개인정보 처리방침 동의 (필수)
 * 3. 얼굴 영상·음성 등 생체정보 수집 및 AI 트윈 생성·활용 동의 — 민감정보 별도 동의 (필수)
 * 4. 마케팅 정보 수신 동의 (선택 — 동의하지 않아도 서비스 이용에 영향 없음)
 *
 * 개인정보보호법 제23조는 생체정보 같은 민감정보 처리에 별도 동의를 요구하고,
 * 마케팅 수신처럼 서비스 이용에 필수가 아닌 항목은 선택 동의로 분리해야 한다.
 * 이용약관과 개인정보 처리방침도 각각 별도 체크박스로 분리해 "보기"에서 실제로
 * 확인한 문서에 대해서만 동의가 성립하도록 한다.
 * "확인했습니다"를 누르면 해당 체크박스가 자동으로 켜진다 — 내용을 한 번도
 * 보여주지 않고 체크박스만 누르면 동의로서 의미가 없다.
 */
export default function AgreementSection({ state, onChange }: SectionProps) {
  const { colors } = useThemeColors();
  const [activeSheet, setActiveSheet] = useState<ConsentSheetKey | null>(null);

  const toggleTerms = () => onChange({ agreedToTerms: !state.agreedToTerms });
  const togglePrivacy = () => onChange({ agreedToPrivacy: !state.agreedToPrivacy });
  const toggleBiometric = () => onChange({ agreedToBiometricData: !state.agreedToBiometricData });
  const toggleMarketing = () => onChange({ agreedToMarketing: !state.agreedToMarketing });

  const activeSheetData = activeSheet ? SHEET_CONTENT[activeSheet] : null;

  // "확인했습니다"로 명시적으로 닫을 때만 해당 체크박스를 자동으로 켠다.
  const handleSheetConfirm = () => {
    if (activeSheet === 'terms') onChange({ agreedToTerms: true });
    else if (activeSheet === 'privacy') onChange({ agreedToPrivacy: true });
    else if (activeSheet === 'biometric') onChange({ agreedToBiometricData: true });
    else if (activeSheet === 'marketing') onChange({ agreedToMarketing: true });
  };

  return (
    <View style={styles.container}>
      <SignupConsentRow
        checked={state.agreedToTerms}
        onToggle={toggleTerms}
        accessibilityLabel="서비스 이용약관 동의"
        onViewDetail={() => setActiveSheet('terms')}
        viewDetailLabel="서비스 이용약관 자세히 보기"
        detail={<Text style={[styles.viewDetailText, { color: colors.brand.accent }]}>보기</Text>}
      >
        <Text style={[styles.baseText, { color: colors.text.secondary }]}>서비스 이용약관 동의 (필수)</Text>
      </SignupConsentRow>

      <SignupConsentRow
        checked={state.agreedToPrivacy}
        onToggle={togglePrivacy}
        accessibilityLabel="개인정보 처리방침 동의"
        onViewDetail={() => setActiveSheet('privacy')}
        viewDetailLabel="개인정보 처리방침 자세히 보기"
        detail={<Text style={[styles.viewDetailText, { color: colors.brand.accent }]}>보기</Text>}
      >
        <Text style={[styles.baseText, { color: colors.text.secondary }]}>개인정보 처리방침 동의 (필수)</Text>
      </SignupConsentRow>

      <SignupConsentRow
        checked={state.agreedToBiometricData}
        onToggle={toggleBiometric}
        accessibilityLabel="생체정보 수집 및 AI 트윈 생성·활용 동의"
        onViewDetail={() => setActiveSheet('biometric')}
        viewDetailLabel="생체정보 수집 및 AI 트윈 활용 동의 자세히 보기"
        detail={<Text style={[styles.viewDetailText, { color: colors.brand.accent }]}>보기</Text>}
      >
        <Text style={[styles.baseText, { color: colors.text.secondary }]}>
          얼굴·음성 등 <Text style={[styles.emphasisText, { color: colors.text.primary }]}>생체정보 수집 및 AI 트윈 생성·활용</Text> 동의 (필수)
        </Text>
      </SignupConsentRow>

      <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />

      <SignupConsentRow
        checked={state.agreedToMarketing}
        onToggle={toggleMarketing}
        accessibilityLabel="마케팅 정보 수신 동의"
        onViewDetail={() => setActiveSheet('marketing')}
        viewDetailLabel="마케팅 정보 수신 동의 자세히 보기"
        detail={<Text style={[styles.viewDetailText, { color: colors.brand.accent }]}>보기</Text>}
      >
        <Text style={[styles.baseText, { color: colors.text.secondary }]}>이벤트·혜택 등 마케팅 수신 (선택)</Text>
      </SignupConsentRow>

      <ConsentDetailSheet
        visible={activeSheetData !== null}
        onClose={() => setActiveSheet(null)}
        onConfirm={handleSheetConfirm}
        title={activeSheetData?.title ?? ''}
        content={activeSheetData?.content ?? ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xxs, alignSelf: 'stretch' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.xs },
  baseText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.regular, lineHeight: 22 },
  emphasisText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
  viewDetailText: { color: Colors.primary.electricCyan, fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.medium, lineHeight: 18, textDecorationLine: 'underline' },
});
