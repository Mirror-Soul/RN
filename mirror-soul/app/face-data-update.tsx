import FaceDataCameraStage from '@/src/components/home/grow/face-data/FaceDataCameraStage';
import FaceDataCaptureButton from '@/src/components/home/grow/face-data/FaceDataCaptureButton';
import FaceDataHeader from '@/src/components/home/grow/face-data/FaceDataHeader';
import FaceDataPromptCard from '@/src/components/home/grow/face-data/FaceDataPromptCard';
import { useFaceDataCapture } from '@/src/components/home/grow/face-data/hooks/useFaceDataCapture';
import { useFaceDataProcessor } from '@/src/components/home/grow/face-data/hooks/useFaceDataProcessor';
import { Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraDevice } from 'react-native-vision-camera';

/**
 * 얼굴 데이터(표정) 업데이트 화면
 * "성장" 탭 FaceDataMissionCard에서 진입 — voice-update.tsx와 동일한 구조의
 * 풀스크린 캡처 플로우입니다.
 *
 * 얼굴이 화면에 있는 동안만 진행되고, '미소'는 MLKit smilingProbability로 실제 감지,
 * 나머지 표정은 얼굴이 있을 때 사용자가 직접 확인 버튼을 눌러야 진행됩니다(순수 타이머 아님).
 * 촬영 시작 버튼은 스크롤 여부와 무관하게 항상 화면 하단에 고정됩니다.
 *
 * TODO: API 연동 시 useFaceDataCapture의 mock 완료 처리를 실제 업로드로 교체.
 */
export default function FaceDataUpdateScreen() {
  const { contentContainerStyle } = useLayout();
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('front');

  const {
    cameraRef,
    phase,
    currentPrompt,
    promptIndex,
    totalPrompts,
    isFaceDetected,
    isSmiling,
    startCapture,
    onCameraInitialized,
    handleFaceDetection,
    confirmCurrentPrompt,
    reset,
  } = useFaceDataCapture();

  const { frameProcessor } = useFaceDataProcessor({
    onFaceDetected: handleFaceDetection,
    isActive: phase === 'recording',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <View style={styles.container}>
        <FaceDataHeader />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <FaceDataPromptCard
            prompt={currentPrompt}
            stepIndex={promptIndex}
            totalSteps={totalPrompts}
            isRecording={phase === 'recording'}
            isFaceDetected={isFaceDetected}
            isSmiling={isSmiling}
            onConfirm={confirmCurrentPrompt}
          />

          <FaceDataCameraStage
            ref={cameraRef}
            phase={phase}
            device={device}
            frameProcessor={frameProcessor}
            isFaceDetected={isFaceDetected}
            onInitialized={onCameraInitialized}
          />
        </ScrollView>

        {/* 촬영 시작 버튼은 스크롤 영역 밖에 고정 — 스크롤 없이도 항상 보이도록 */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <FaceDataCaptureButton phase={phase} onStart={startCapture} onRetry={reset} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    gap: Spacing.xxl,
  },
  footer: {
    paddingTop: Spacing.md,
  },
});
