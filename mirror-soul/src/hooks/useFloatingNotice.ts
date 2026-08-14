import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

const SHOW_DURATION_MS = 2200;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 220;

/**
 * 페이드 인/아웃으로 잠깐 떴다 사라지는 플로팅 알림 상태를 관리하는 훅.
 * RN `Modal`(예: BottomSheetModal) 내부에서는 전역 토스트가 별도 네이티브 레이어에 가려 안 보이므로,
 * 모달 내부에 떠야 하는 경고/에러 메시지는 이 훅 + FloatingNotice 컴포넌트를 쓴다.
 */
export const useFloatingNotice = () => {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const flash = (text: string) => {
    setMessage(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    opacity.stopAnimation();
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    timeoutRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setMessage(null));
    }, SHOW_DURATION_MS);
  };

  return { message, opacity, flash };
};
