import { useCallback, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function useMessageInput(onSend: (text: string) => Promise<boolean>) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // 전송 버튼 scale 애니메이션
  const sendScale = useSharedValue(1);

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

  const animatedSendStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sendScale.value }],
    };
  });

  return {
    text,
    setText,
    inputRef,
    handleSendPressIn,
    handleSendPressOut,
    handleSend,
    isSending,
    animatedSendStyle,
  };
}
