import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Animated, Alert, ScrollView } from 'react-native';
import {Colors, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useRouter } from 'expo-router';
import { useCameraDevice } from 'react-native-vision-camera';

// Step5 Component Imports
import FaceScanGlow from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanGlow';
import FaceScanHeader from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanHeader';
import FaceScanBody from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanBody';
import FaceScanButton from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanButton';
import FaceGuideOverlay from '@/src/components/signup/steps/Step5_FaceScan/components/FaceGuideOverlay';
import FaceCameraView from '@/src/components/signup/steps/Step5_FaceScan/components/FaceCameraView';

// Hook Imports
import { useFaceScan } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScan';
import { useFaceProcessor } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceProcessor';
import { useFaceScanUpload } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScanUpload';

/**
 * 3D Face Scan 메인 화면
 *
 * 이 화면은 상단 안내(Header), 중앙 스캔 영역(Body), 하단 제어(Button)로 구성됩니다.
 * useFaceScan 훅을 통해 상태를 관리하고, useFaceProcessor 훅을 통해 고성능 카메라 엔진을 구동합니다.
 */
export default function FaceScanScreen() {
  const router = useRouter();
  const device = useCameraDevice('front');
  const { contentContainerStyle } = useLayout();

  // 1. 상태 및 비즈니스 로직 관리
  const {
    cameraRef,
    phase,
    currentDirection,
    currentDirectionIndex,
    completedDirections,
    isDirectionMatching,
    startScan,
    onCameraInitialized,
    handleFaceDetection,
    videoUri,
  } = useFaceScan();

  const { uploadFaceVideo } = useFaceScanUpload();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // --- 업로드 자동 시작 및 재시도 로직 ---
  useEffect(() => {
    if (phase === 'completed' && videoUri && uploadStatus === 'idle') {
      setUploadStatus('uploading');
      uploadFaceVideo(videoUri)
        .then((success) => {
          if (success) setUploadStatus('success');
        })
        .catch((err) => {
          setUploadStatus('error');
          Alert.alert('업로드 실패', err.message || '업로드 중 오류가 발생했습니다.', [
            { text: '다시 시도', onPress: () => setUploadStatus('idle') },
          ]);
        });
    }
  }, [phase, videoUri, uploadStatus, uploadFaceVideo]);

  // --- 화면에 보여줄 Phase 계산 ---
  // 스캔이 완료되었지만 업로드가 끝나지 않았다면 'finalizing'을 재사용하여 로딩 UI 유지
  const displayPhase =
    phase === 'completed'
      ? uploadStatus === 'success'
        ? 'completed'
        : 'finalizing'
      : phase;

  // 2. 고성능 카메라 프레임 프로세서 엔진 (Ref Pattern 적용으로 Stale Closure 문제 해결)
  const { frameProcessor } = useFaceProcessor({
    onFaceDetected: handleFaceDetection,
    isActive: phase === 'scanning',
  });

  // --- 완료 애니메이션 제어 ---
  const completionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (displayPhase === 'completed') {
      Animated.spring(completionAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      completionAnim.setValue(0);
    }
  }, [displayPhase, completionAnim]);

  // --- 이벤트 핸들러 ---
  const handleNext = () => {
    // '/'는 (main) 홈 탭과 로그인 화면이 동시에 매칭될 수 있어 명시적으로 홈을 지정한다.
    router.replace('/(main)');
  };

  // --- 텍스트 결정 로직 ---
  const guideMessage =
    displayPhase === 'scanning'
      ? currentDirection.guideMessage
      : displayPhase === 'finalizing'
        ? '스캔 데이터를 처리 중입니다...'
        : displayPhase === 'completed'
          ? '스캔이 완료되었습니다!'
          : undefined;

  // --- Finalizing 애니메이션 ---
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    if (displayPhase === 'finalizing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [displayPhase, pulseAnim]);

  return (
    <View style={styles.baseContainer}>
      <FaceScanGlow />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* 헤더 섹션 */}
        <View style={styles.headerWrapper}>
          <FaceScanHeader guideMessage={guideMessage} />
        </View>

        {/* 메인 스캔 영역 (Body) */}
        <View style={styles.bodyWrapper}>
          <FaceScanBody phase={displayPhase}>
            {/* 카메라 뷰: 스캔 및 처리 중일 때만 표시 (마운트 유지를 통해 콜백 수신) */}
            {device && (displayPhase === 'scanning' || displayPhase === 'finalizing') && (
              <FaceCameraView
                ref={cameraRef}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                onInitialized={onCameraInitialized}
              />
            )}

            {/* 가이드 오버레이 */}
            {displayPhase === 'scanning' && (
              <FaceGuideOverlay
                currentDirection={currentDirection}
                currentDirectionIndex={currentDirectionIndex}
                completedDirections={completedDirections}
                isDirectionMatching={isDirectionMatching}
              />
            )}

            {/* Finalizing (저장 중) 애니메이션 오버레이: 카메라 화면 완전 가림 */}
            {displayPhase === 'finalizing' && (
              <View style={[styles.completionOverlay, { backgroundColor: Colors.primary.soulBlack }]}>
                <Animated.View
                  style={[
                    styles.processingCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              </View>
            )}

            {/* 완료 체크마크 애니메이션 */}
            {displayPhase === 'completed' && (
              <Animated.View
                style={[
                  styles.completionOverlay,
                  {
                    opacity: completionAnim,
                    transform: [{ scale: completionAnim }],
                  },
                ]}
              >
                <View style={styles.checkmarkCircle}>
                  <Animated.Text style={styles.checkmarkText}>✓</Animated.Text>
                </View>
              </Animated.View>
            )}
          </FaceScanBody>
        </View>

        {/* 하단 제어 섹션 */}
        <View style={styles.buttonWrapper}>
          <FaceScanButton
            phase={displayPhase}
            onStartScan={startScan}
            onNext={handleNext}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 16 : 8,
    paddingBottom: 50,
    paddingHorizontal: Spacing.xxl,
  },
  headerWrapper: {
    width: '100%',
  },
  bodyWrapper: {
    width: '100%',
    marginTop: Spacing.xxxl,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: Spacing.giant,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  processingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary.electricCyan,
    borderStyle: 'dashed',
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
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
  checkmarkText: {
    color: Colors.primary.soulBlack,
    fontSize: FontSize.giant,
    fontWeight: FontWeight.bold,
  },
});
