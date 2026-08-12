import FaceCameraView from '@/src/components/signup/steps/Step5_FaceScan/components/FaceCameraView';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { forwardRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Camera, CameraDevice, ReadonlyFrameProcessor } from 'react-native-vision-camera';
import { FaceDataCapturePhase } from './types/faceData';

interface FaceDataCameraStageProps {
  phase: FaceDataCapturePhase;
  device: CameraDevice | undefined;
  frameProcessor: ReadonlyFrameProcessor;
  isFaceDetected: boolean;
  onInitialized: () => void;
}

/**
 * FaceDataCameraStage 컴포넌트 (SRP)
 * 얼굴 데이터 캡처의 카메라 프리뷰 영역 — Step5_FaceScan의 풀스크린 뷰파인더 대신
 * 성장 탭 다른 카드/모달과 동일한 라운드 컨테이너(글래스 카드 톤) 안에 카메라를 담는다.
 * 라이트/다크 테마를 모두 따르도록 배경·테두리는 useThemeColors를 사용한다.
 *
 * - idle: 카드 배경 플레이스홀더 + 카메라 아이콘
 * - recording: 실제 카메라 프리뷰
 * - processing: 반투명 오버레이 + 로딩 인디케이터
 * - done: 완료 체크마크
 */
const FaceDataCameraStage = forwardRef<Camera, FaceDataCameraStageProps>(
  ({ phase, device, frameProcessor, isFaceDetected, onInitialized }, ref) => {
    const { colors } = useThemeColors();

    return (
      <View style={[styles.container, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
        {phase === 'idle' && (
          <View style={styles.placeholder}>
            <View style={[styles.placeholderIconWrapper, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
              <Feather name="camera" size={36} color={Colors.primary.electricCyan} />
            </View>
            <Text style={[styles.placeholderText, { color: colors.text.muted }]}>아래 버튼을 눌러 촬영을 시작해 주세요</Text>
          </View>
        )}

        {device && (phase === 'recording' || phase === 'processing') && (
          <FaceCameraView
            ref={ref}
            device={device}
            isActive={true}
            frameProcessor={phase === 'recording' ? frameProcessor : undefined}
            onInitialized={onInitialized}
          />
        )}

        {phase === 'recording' && !isFaceDetected && (
          <View style={styles.faceWarningBanner}>
            <Feather name="alert-circle" size={14} color={Colors.neutral.pureWhite} />
            <Text style={styles.faceWarningText}>얼굴이 보이지 않아요</Text>
          </View>
        )}

        {phase === 'processing' && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={Colors.primary.electricCyan} />
          </View>
        )}

        {phase === 'done' && (
          <View style={[styles.overlay, styles.doneOverlay]}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={36} color={Colors.primary.soulBlack} />
            </View>
          </View>
        )}
      </View>
    );
  }
);

FaceDataCameraStage.displayName = 'FaceDataCameraStage';

export default FaceDataCameraStage;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
  },
  placeholderIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  faceWarningBanner: {
    position: 'absolute',
    top: Spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  faceWarningText: {
    color: Colors.neutral.pureWhite,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  doneOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.successGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.successGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
});
