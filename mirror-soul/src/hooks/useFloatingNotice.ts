import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

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
    // 스크린리더 사용자에게도 알림을 전달한다 — 라이브 리전만으로는 동일한 메시지가
    // 반복될 때(예: 제한 초과를 연달아 탭) 변경 감지가 안 돼 announce가 안 될 수 있다.
    AccessibilityInfo.announceForAccessibility(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // stopAnimation()은 진행 중이던 이전 fade-out의 완료 콜백을 { finished: false }로 즉시 호출한다.
    // finished 체크 없이 setMessage(null)을 부르면, 방금 위에서 세팅한 새 메시지가
    // 그 자리에서 지워지는 레이스가 생긴다 — 자연스럽게 끝난 애니메이션에서만 초기화한다.
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
      }).start(({ finished }) => {
        if (finished) setMessage(null);
      });
    }, SHOW_DURATION_MS);
  };

  return { message, opacity, flash };
};
