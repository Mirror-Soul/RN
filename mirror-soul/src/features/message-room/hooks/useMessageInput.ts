import { useState, useRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '@/src/constants/theme';

export function useMessageInput(onSend: (text: string) => Promise<boolean>) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // 전송 버튼 scale 애니메이션
  const sendScale = useSharedValue(1);
  // 입력창 border color 애니메이션 (0: 기본, 1: 포커스)
  const borderProgress = useSharedValue(0);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderProgress.value = withTiming(1, { duration: 300 });
  }, [borderProgress]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    borderProgress.value = withTiming(0, { duration: 300 });
  }, [borderProgress]);

  const handleSendPressIn = useCallback(() => {
    sendScale.value = withSpring(0.9, { damping: 15 });
  }, [sendScale]);

  const handleSendPressOut = useCallback(() => {
    sendScale.value = withSpring(1, { damping: 15 });
  }, [sendScale]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      // API 성공 전에는 입력값을 지우지 않는다. 전송 실패 시 사용자가 문장을 다시 쓰지 않고
      // 그대로 재시도할 수 있어야 한다.
      const sent = await onSend(trimmed);
      if (sent) setText('');
    } finally {
      setIsSending(false);
    }
  }, [text, onSend, isSending]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        borderProgress.value,
        [0, 1],
        [Colors.glass.white10, Colors.primary.electricCyan]
      ),
    };
  });

  const animatedSendStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sendScale.value }],
    };
  });

  return {
    text,
    setText,
    isFocused,
    inputRef,
    handleFocus,
    handleBlur,
    handleSendPressIn,
    handleSendPressOut,
    handleSend,
    isSending,
    animatedContainerStyle,
    animatedSendStyle,
  };
}
