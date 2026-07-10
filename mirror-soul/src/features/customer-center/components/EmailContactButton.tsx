import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { SUPPORT_EMAIL } from '../constants/faqData';

/**
 * 이메일 문의 버튼
 *
 * - CSS 명세: Cyan→Purple 그라디언트 배경 + Cyan 테두리
 * - Linking.openURL로 기기 기본 메일 앱 실행
 * - 메일 앱 미설치 기기 대비 canOpenURL 사전 체크
 */
export const EmailContactButton = () => {
  const handlePress = async () => {
    const subject = encodeURIComponent('[Mirror Soul] 문의합니다');
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;

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
      <Text style={styles.label}>해결되지 않은 문제가 있으신가요?</Text>

      <View style={styles.buttonWrapper}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          accessibilityLabel="이메일로 문의하기"
        >
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.18)', 'rgba(168, 85, 247, 0.18)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientFill}
          />
          <Feather name="mail" size={20} color="#53EAFD" />
          <Text style={styles.buttonText}>이메일로 문의하기</Text>
        </Pressable>
      </View>

      <Text style={styles.emailAddress}>{SUPPORT_EMAIL}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 32,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
    borderRadius: 16,
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
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#53EAFD',
  },
  emailAddress: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A5565',
    textAlign: 'center',
    marginTop: 12,
  },
});
