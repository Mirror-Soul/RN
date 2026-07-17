import React from 'react';
import { FontFamily } from '@/src/constants/theme';

import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { SUPPORT_EMAIL } from '../constants/faqData';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const EmailContactButton = () => {
  const { animatedTextMuted } = useAnimatedTheme();

  const handlePress = async () => {
    const subject = encodeURIComponent('[Mirror Soul] 고객센터 문의');
    const bodyTemplate = `아래 양식에 맞춰 문의 내용을 작성해 주시면 더욱 빠른 확인이 가능합니다.

---
■ 사용 중인 기기 (예: iPhone 14 Pro, 갤럭시 S23 등): 
■ OS 버전 (예: iOS 17, Android 14 등): 
■ 로그인 계정: 
■ 문의 내용: 
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
      <Animated.Text style={[styles.label, animatedTextMuted]}>해결되지 않은 문제가 있으신가요?</Animated.Text>

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

      <Animated.Text style={[styles.emailAddress, animatedTextMuted]}>{SUPPORT_EMAIL}</Animated.Text>
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
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
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
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#53EAFD',
  },
  emailAddress: {
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
