import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface CallScreenBackgroundProps {
  /** error면 시안/퍼플 대신 은은한 레드 톤으로 위험 신호를 겹친다 */
  variant?: 'default' | 'error';
  children: React.ReactNode;
}

/** '#RRGGBB' → 'rgba(r,g,b,alpha)'. state.danger 등 opaque 테마 컬러를 은은한 글로우로 쓸 때 사용 */
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 통화 관련 화면(연결 대기/실패/통화 중) 공통 배경.
 * 각 화면이 제각각 flat black을 쓰던 걸 하나로 통일해, 테마의 glow 토큰(colors.glow)으로
 * 은은하게 감싸는 톤을 어디서나 동일하게 유지한다. 라이트/다크 모드 모두 대응한다.
 */
export default function CallScreenBackground({ variant = 'default', children }: CallScreenBackgroundProps) {
  const { colors } = useThemeColors();

  const topGlow: [string, string, string] =
    variant === 'error'
      ? [hexToRgba(colors.state.danger, 0.16), colors.glow.purple, 'rgba(0, 0, 0, 0)']
      : [colors.glow.cyan, colors.glow.purple, 'rgba(0, 0, 0, 0)'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <LinearGradient colors={topGlow} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 0.6 }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', colors.glow.cyanInner]}
        start={{ x: 0.9, y: 1 }}
        end={{ x: 0.2, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
