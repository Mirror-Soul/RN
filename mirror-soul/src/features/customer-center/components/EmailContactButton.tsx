import React from 'react';
import {FontFamily, FontSize, FontWeight, Radii, Colors, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SUPPORT_EMAIL } from '../constants/faqData';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export type SupportInquiryTopic = 'job-verification' | 'mbti-change' | 'introduction-edit';

const INQUIRY_PRESETS: Record<SupportInquiryTopic, { subject: string; label: string; extraFields: string }> = {
  'job-verification': {
    subject: '[Mirror Soul] 직업 인증 문의',
    label: '직업 인증 문의 작성',
    extraFields: '■ 직업/직군:\n■ 첨부할 인증 서류 (재직증명서, LinkedIn 등):\n',
  },
  'mbti-change': {
    subject: '[Mirror Soul] MBTI 변경 문의',
    label: 'MBTI 변경 문의 작성',
    extraFields: '■ 변경 요청 MBTI:\n■ 검사 결과 이미지 첨부 여부:\n',
  },
  'introduction-edit': {
    subject: '[Mirror Soul] 자기소개 수정 요청',
    label: '자기소개 수정 요청 작성',
    extraFields: '■ 수정할 자기소개 문구:\n',
  },
};

export const EmailContactButton = ({ topic }: { topic?: SupportInquiryTopic }) => {
  const { colors } = useThemeColors();
  const preset = topic ? INQUIRY_PRESETS[topic] : null;

  const handlePress = async () => {
    const subject = encodeURIComponent(preset?.subject ?? '[Mirror Soul] 고객센터 문의');
    const bodyTemplate = `아래 양식에 맞춰 문의 내용을 작성해 주시면 더욱 빠른 확인이 가능합니다.

---
■ 사용 중인 기기 (예: iPhone 14 Pro, 갤럭시 S23 등): 
■ OS 버전 (예: iOS 17, Android 14 등): 
■ 로그인 계정: 
${preset?.extraFields ?? ''}■ 문의 내용:
(여기에 자세한 문의 내용을 남겨주세요)
---

감사합니다.`;
    
    const body = encodeURIComponent(bodyTemplate);
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          '메일 앱을 열 수 없습니다',
          `${SUPPORT_EMAIL} 으로 직접 문의해 주세요.`,
          [{ text: '확인' }]
        );
      }
    } catch {
      Alert.alert(
        '오류가 발생했습니다',
        `${SUPPORT_EMAIL} 으로 직접 문의해 주세요.`,
        [{ text: '확인' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text.muted }]}>해결되지 않은 문제가 있으신가요?</Text>

      <View style={styles.buttonWrapper}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          accessibilityLabel={preset?.label ?? '이메일로 문의하기'}
        >
          <LinearGradient
            colors={[Colors.glass.cyan18, 'rgba(168, 85, 247, 0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
          <Feather name="mail" size={20} color="#53EAFD" />
          <Text style={styles.buttonText}>{preset?.label ?? '이메일로 문의하기'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.emailAddress, { color: colors.text.muted }]}>{SUPPORT_EMAIL}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 10,
    borderRadius: Radii.lg,
    borderWidth: 0.61,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#53EAFD',
  },
  emailAddress: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
