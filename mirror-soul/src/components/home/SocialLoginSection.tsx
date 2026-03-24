import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// SVG 파일을 컴포넌트로 활용 (react-native-svg-transformer)
import AppleIcon from '@/assets/images/social_login/Apple_Button.svg';
import GoogleIcon from '@/assets/images/social_login/Google_Button.svg';
import KakaoIcon from '@/assets/images/social_login/Kakao_Button.svg';
import { Colors } from '@/src/constants/theme';

/**
 * 소셜 로그인 섹션 컴포넌트
 * 구분선(or continue with) 및 버튼 그룹 렌더링
 */
export default function SocialLoginSection() {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity activeOpacity={0.8}>
          <KakaoIcon width={90} height={90} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}>
          <AppleIcon width={90} height={90} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8}>
          <GoogleIcon width={90} height={90} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
    height: 0.6,
    backgroundColor: Colors.glass.white10,
  },
  dividerText: {
    color: Colors.neutral.darkGray,
    fontSize: 12,
    fontWeight: '400',
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  }
});
