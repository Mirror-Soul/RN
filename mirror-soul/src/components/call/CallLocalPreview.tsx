import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface CallLocalPreviewProps {
  isCameraOn: boolean;
}

/**
 * 내 카메라 셀프뷰 PIP(우상단 고정) — 레이아웃 자리표시자.
 *
 * 실제 로컬 카메라 캡처(useWebRTCCall)는 아직 음성만 획득하므로(getUserMedia video:false),
 * 카메라 스트림 연동 전까지는 켬/꺼짐 상태만 아이콘으로 표시한다. 카메라 스트림이 붙으면
 * 이 컴포넌트 안쪽만 RTCView로 교체하면 되도록 자리를 미리 잡아둔다.
 * 배경은 CallScreenBackground/AIOrb와 동일한 브랜드 그라디언트 톤으로 맞춘다.
 */
export default function CallLocalPreview({ isCameraOn }: CallLocalPreviewProps) {
  const { colors, isDark } = useThemeColors();

  return (
    <View style={styles.container}>
      {isCameraOn ? (
        <LinearGradient
          colors={Colors.gradient.avatarPlaceholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.placeholder}
        >
          {/* 실제 카메라 스트림 연동 전까지의 자리표시자 */}
          <Ionicons name="person" size={26} color={Colors.primary.electricCyan} />
        </LinearGradient>
      ) : (
        <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={styles.placeholder}>
          <Ionicons name="videocam-off" size={20} color={colors.text.muted} />
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 96,
    height: 128,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
