import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useRouter } from 'expo-router';
import { Colors, FontFamily } from '@/src/constants/theme';
import GradientButton from '@/src/components/common/GradientButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface SignupTabViewProps {
  /** "이미 계정이 있으신가요?" 탭 전환 콜백 */
  onLoginTabPress: () => void;
}

/**
 * SignupTabView 컴포넌트
 * 회원가입 탭의 전문 디자이너 수준 브랜딩 뷰. (SRP)
 *
 * Feature list 방식 ❌ → 미니멀 타이포그래피 + 단일 CTA ✓
 * - 그라디언트 헤드카피 (MaskedView)
 * - 서브카피
 * - 회원가입 시작 CTA
 * - 로그인 링크
 */
export default function SignupTabView({ onLoginTabPress }: SignupTabViewProps) {
  const router = useRouter();
  const { colors } = useThemeColors();

  const handleStartSignup = useCallback(() => {
    router.push('/signup');
  }, [router]);

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.container}>
      {/* 헤드카피 — 그라디언트 텍스트 */}
      <View style={styles.headlineWrapper}>
        <MaskedView
          style={styles.maskedView}
          maskElement={
            <View style={styles.maskContainer}>
              <Text style={styles.headlineText}>
                알고리즘이 찾아낸{'\n'}나의 완벽한 주파수
              </Text>
            </View>
          }
        >
          <LinearGradient
            colors={Colors.gradient.cyanToPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </MaskedView>
        {/* 레이아웃 스페이서 (MaskedView absolute 기준점) */}
        <Text style={[styles.headlineText, styles.spacer]}>
          알고리즘이 찾아낸{'\n'}나의 완벽한 주파수
        </Text>
      </View>

      {/* 서브카피 */}
      <Text style={[styles.subCapyText, { color: colors.text.secondary }]}>
        불필요한 감정 소모 없는 진짜 매칭,{'\n'}지금 바로 시작해보세요.
      </Text>

      {/* CTA 버튼 */}
      <GradientButton
        title="회원가입 시작하기"
        onPress={handleStartSignup}
        variant="full"
        style={styles.ctaButton}
      />

      {/* 로그인 링크 */}
      <TouchableOpacity
        style={styles.loginLinkWrapper}
        onPress={onLoginTabPress}
        accessibilityRole="button"
        accessibilityLabel="로그인하기"
      >
        <Text style={[styles.loginLinkText, { color: colors.text.secondary }]}>
          이미 계정이 있으신가요?{' '}
          <Text style={styles.loginLinkAccent}>로그인하기</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 24, // 타이포그래피 중심이므로 여백을 늘려 숨쉴 공간 확보
    paddingVertical: 16,
  },

  // ── 헤드카피 ───────────────────────────────────────────────
  headlineWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 20, // 위쪽 여백 추가
  },
  maskedView: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: {
    fontFamily: FontFamily.sans,
    fontSize: 30, // 폰트 크기를 키워 임팩트 부여
    fontWeight: '300',
    lineHeight: 42,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#FFF', // 마스킹 텍스트는 색상 무관, 기준점용 텍스트는 투명처리됨
  },
  spacer: {
    opacity: 0, // 레이아웃 기준점만 잡고 숨김
  },

  // ── 서브카피 ───────────────────────────────────────────────
  subCapyText: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.2,
    textAlign: 'center',
  },

  // ── CTA ───────────────────────────────────────────────────
  ctaButton: {
    marginTop: 12,
  },

  // ── 로그인 링크 ───────────────────────────────────────────
  loginLinkWrapper: {
    paddingVertical: 4,
  },
  loginLinkText: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  loginLinkAccent: {
    color: Colors.primary.electricCyan,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
