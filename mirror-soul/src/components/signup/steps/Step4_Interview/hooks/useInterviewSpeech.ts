import { useState } from 'react';

/**
 * 인터뷰 녹음 및 음성 상태를 관리하는 커스텀 훅.
 * 현재는 UI 프로토타이핑을 위해 상태 토글 기능만 제공하며,
 * 추후 expo-av를 통한 실제 녹음 로직이 통합될 예정입니다.
 */
export function useInterviewSpeech() {
  const [isRecording, setIsRecording] = useState(false);
  
  // 녹음 시작/중지 토글
  const toggleRecording = () => {
    setIsRecording(prev => !prev);
  };

  return {
    isRecording,
    toggleRecording,
  };
}
