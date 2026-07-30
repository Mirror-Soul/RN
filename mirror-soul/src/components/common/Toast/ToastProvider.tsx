import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3000;

/**
 * 컴포넌트 트리 밖(zustand 스토어, apiClient 인터셉터 등)에서도 토스트를 띄울 수 있도록
 * ToastProvider가 마운트될 때 자신의 showToast를 등록해두는 모듈 레벨 브릿지.
 * (React Navigation의 navigationRef와 동일한 패턴)
 */
let externalShowToast: ((message: string, type?: ToastType) => void) | null = null;

export const showGlobalToast = (message: string, type: ToastType = 'error') => {
  externalShowToast?.(message, type);
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
};

/**
 * 앱 전역 토스트 프로바이더.
 * `app/_layout.tsx`에서 <Stack>과 형제로 최상위에 마운트해 모든 화면 위에 뜨도록 한다.
 */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  const dismiss = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setToast({ id: Date.now(), message, type });
    dismissTimer.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    // accessibilityLiveRegion은 iOS에서 지원이 제한적이라, 명령형 announce를 함께 호출해 스크린리더에도 확실히 전달한다.
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  useEffect(() => {
    externalShowToast = showToast;
    return () => {
      externalShowToast = null;
    };
  }, [showToast]);

  const accentColor =
    toast?.type === 'error'
      ? colors.state.danger
      : toast?.type === 'success'
        ? colors.state.success
        : colors.brand.accent;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeInDown.duration(220)}
          exiting={FadeOutUp.duration(180)}
          style={[
            styles.container,
            { top: insets.top + Spacing.md, backgroundColor: colors.background.glass, borderColor: accentColor },
          ]}
          pointerEvents="box-none"
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Pressable onPress={dismiss} style={styles.pressable} accessibilityLabel="알림 닫기" accessibilityRole="button">
            <Text style={[styles.message, { color: colors.text.primary }]} numberOfLines={3}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.xxl,
    right: Spacing.xxl,
    zIndex: 1000,
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressable: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  message: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
