import CompleteIcon from '@/assets/images/common/Complete.svg';
import { Colors, Radii, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step1';
import { ConsentDetailSheet } from '@/src/components/common/ConsentDetailSheet';
import {
  TERMS_OF_SERVICE_CONTENT,
  PRIVACY_POLICY_CONTENT,
  BIOMETRIC_CONSENT_CONTENT,
  MARKETING_CONSENT_CONTENT,
} from '@/src/constants/consentContent';

type ConsentSheetKey = 'terms' | 'privacy' | 'biometric' | 'marketing';

const SHEET_CONTENT: Record<ConsentSheetKey, { title: string; content: string }> = {
  terms: { title: '서비스 이용약관', content: TERMS_OF_SERVICE_CONTENT },
  privacy: { title: '개인정보 처리방침', content: PRIVACY_POLICY_CONTENT },
  biometric: { title: '생체정보 수집 및 AI 트윈 활용 동의', content: BIOMETRIC_CONSENT_CONTENT },
  marketing: { title: '마케팅 정보 수신 동의', content: MARKETING_CONSENT_CONTENT },
};

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
}

function Checkbox({ checked, onToggle, accessibilityLabel }: CheckboxProps) {
  return (
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
  );
}

interface AgreementRowProps {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
  onViewDetail: () => void;
  viewDetailLabel: string;
  children: React.ReactNode;
}

/** 단일 문서에 대한 동의 행 — 체크박스 텍스트를 누르면 토글, "보기"를 누르면 상세 시트가 열린다. */
function AgreementRow({
  checked,
  onToggle,
  accessibilityLabel,
  onViewDetail,
  viewDetailLabel,
  children,
}: AgreementRowProps) {
  return (
    <View style={styles.row}>
      <Checkbox checked={checked} onToggle={onToggle} accessibilityLabel={accessibilityLabel} />

      <TouchableOpacity style={styles.textContainer} onPress={onToggle} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onViewDetail}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={viewDetailLabel}
      >
        <Text style={styles.viewDetailText}>보기</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * AgreementSection 컴포넌트 (SRP)
 *
 * 동의 항목:
 * 1. 서비스 이용약관 + 개인정보 처리방침 (필수, 체크박스 1개 — 두 문서는 각각 별도로 열람 가능)
 * 2. 얼굴 영상·음성 등 생체정보 수집 및 AI 트윈 생성·활용 동의 — 민감정보 별도 동의 (필수)
 * 3. 마케팅 정보 수신 동의 (선택 — 동의하지 않아도 서비스 이용에 영향 없음)
 *
 * 개인정보보호법 제23조는 생체정보 같은 민감정보 처리에 별도 동의를 요구하고,
 * 마케팅 수신처럼 서비스 이용에 필수가 아닌 항목은 선택 동의로 분리해야 한다.
 * "보기"를 누르면 실제 동의 내용을 바텀시트로 확인할 수 있다 — 체크박스만 누르고
 * 내용을 한 번도 보여주지 않으면 동의로서 의미가 없다.
 */
export default function AgreementSection({ state, onChange }: SectionProps) {
  const [activeSheet, setActiveSheet] = useState<ConsentSheetKey | null>(null);

  const toggleTerms = () => onChange({ agreedToTerms: !state.agreedToTerms });
  const toggleBiometric = () => onChange({ agreedToBiometricData: !state.agreedToBiometricData });
  const toggleMarketing = () => onChange({ agreedToMarketing: !state.agreedToMarketing });

  const activeSheetData = activeSheet ? SHEET_CONTENT[activeSheet] : null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Checkbox
          checked={state.agreedToTerms}
          onToggle={toggleTerms}
          accessibilityLabel="서비스 이용약관 및 개인정보 처리방침에 동의"
        />

        {/*
          주의: 안쪽 링크 Text가 각자 onPress를 가지므로 바깥을 TouchableOpacity로
          감싸지 않는다 — 감싸면 RN 터치 응답자 협상 때문에 링크 탭이 씹히거나
          체크박스 토글과 동시에 발동될 수 있다. 체크박스 토글은 체크박스 자체로만.
        */}
        <View style={styles.textContainer}>
          <Text style={styles.baseText}>
            <Text
              style={styles.link}
              onPress={() => setActiveSheet('terms')}
              accessibilityRole="link"
              accessibilityLabel="서비스 이용약관 보기"
            >
              서비스 이용약관
            </Text>
            <Text style={styles.baseText}> 및 </Text>
            <Text
              style={styles.link}
              onPress={() => setActiveSheet('privacy')}
              accessibilityRole="link"
              accessibilityLabel="개인정보 처리방침 보기"
            >
              개인정보 처리방침
            </Text>
            <Text style={styles.baseText}>에 동의합니다. (필수)</Text>
          </Text>
        </View>
      </View>

      <AgreementRow
        checked={state.agreedToBiometricData}
        onToggle={toggleBiometric}
        accessibilityLabel="생체정보 수집 및 AI 트윈 생성·활용 동의"
        onViewDetail={() => setActiveSheet('biometric')}
        viewDetailLabel="생체정보 수집 및 AI 트윈 활용 동의 자세히 보기"
      >
        <Text style={styles.baseText}>
          얼굴 영상, 음성 등{' '}
          <Text style={styles.emphasisText}>생체정보 수집 및 AI 트윈 생성·활용</Text>에 동의합니다.
          (필수)
        </Text>
      </AgreementRow>

      <View style={styles.divider} />

      <AgreementRow
        checked={state.agreedToMarketing}
        onToggle={toggleMarketing}
        accessibilityLabel="마케팅 정보 수신 동의"
        onViewDetail={() => setActiveSheet('marketing')}
        viewDetailLabel="마케팅 정보 수신 동의 자세히 보기"
      >
        <Text style={styles.baseText}>이벤트·혜택 등 마케팅 정보 수신에 동의합니다. (선택)</Text>
      </AgreementRow>

      <ConsentDetailSheet
        visible={activeSheetData !== null}
        onClose={() => setActiveSheet(null)}
        title={activeSheetData?.title ?? ''}
        content={activeSheetData?.content ?? ''}
      />
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
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.glass.white10,
    marginVertical: Spacing.xs,
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
  viewDetailText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textDecorationLine: 'underline',
  },
});
