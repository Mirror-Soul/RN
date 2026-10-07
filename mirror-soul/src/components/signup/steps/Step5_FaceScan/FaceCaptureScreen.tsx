import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useLayout } from '@/src/hooks/useLayout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/store/useAuthStore';
import FaceCameraView from '@/src/components/signup/steps/Step5_FaceScan/components/FaceCameraView';
import FaceGuideOverlay from '@/src/components/signup/steps/Step5_FaceScan/components/FaceGuideOverlay';
import { useFaceScan } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScan';
import { useFaceProcessor } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceProcessor';
import { useFaceScanUpload } from '@/src/components/signup/steps/Step5_FaceScan/hooks/useFaceScanUpload';
import { SCAN_DIRECTIONS } from '@/src/components/signup/steps/Step5_FaceScan/constants/faceScanConfig';
import { fitPreview } from '@/src/components/signup/steps/Step5_FaceScan/utils/captureLayout';
import GrowSubScreenHeader from '@/src/components/home/grow/GrowSubScreenHeader';
import { useGrowthReturn } from '@/src/components/home/grow/useGrowthReturn';

function Action({ title, onPress, disabled = false, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, secondary && styles.secondaryAction, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>
    <Text style={[styles.actionText, secondary && styles.secondaryText]}>{title}</Text>
  </Pressable>;
}

export default function FaceCaptureScreen({ mode = 'onboarding', onRegistered }: { mode?: 'onboarding' | 'update'; onRegistered?: () => void }) {
  const isUpdate = mode === 'update';
  const returnToGrowth = useGrowthReturn();
  const { contentContainerStyle } = useLayout();
  const router = useRouter();
  const { colors } = useThemeColors();
  const { width, height, fontScale } = useWindowDimensions();
  const scan = useFaceScan();
  const upload = useFaceScanUpload(mode);
  const device = useCameraDevice('front');
  const format = useCameraFormat(device, [{ videoResolution: { width: 1280, height: 960 } }, { fps: 30 }]);
  const [available, setAvailable] = useState({ width: 0, height: 0 });
  const ratio = format ? Math.min(format.videoWidth, format.videoHeight) / Math.max(format.videoWidth, format.videoHeight) : 0.75;
  const preview = fitPreview(available.width, available.height, ratio);
  const captureOpen = ['positioning', 'countdown', 'scanning', 'finalizing'].includes(scan.phase);
  const [showInfo, setShowInfo] = useState(false);
  const [registeredOwner, setRegisteredOwner] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const mounted = useRef(true);
  const nextLock = useRef(false);
  const { frameProcessor } = useFaceProcessor({ onFaceDetected: scan.handleFaceDetection, isActive: captureOpen && scan.phase !== 'finalizing', previewSize: preview });

  // 레이아웃 변경 후 이전 좌표의 검출 결과는 사용하지 않는다.
  const updateSize = scan.setPreviewSize;
  const updateSizeRef = useRef(updateSize);
  updateSizeRef.current = updateSize;
  const previewWidth = preview.width;
  const previewHeight = preview.height;
  useEffect(() => { updateSizeRef.current({ width: previewWidth, height: previewHeight }); }, [previewWidth, previewHeight]);
  useEffect(() => {
    mounted.current = true;
    const unsubscribe = useAuthStore.subscribe(state => {
      if (!state.isLoggedIn || state.userUuid !== registeredOwner) setRegisteredOwner(null);
    });
    return () => { mounted.current = false; unsubscribe(); };
  }, [registeredOwner]);

  const register = async () => {
    if (!scan.videoUri || upload.isUploading) return;
    const owner = useAuthStore.getState().userUuid;
    try {
      const saved = await upload.uploadFaceVideo(scan.videoUri);
      if (saved && mounted.current && owner === useAuthStore.getState().userUuid && useAuthStore.getState().isLoggedIn) { setRegisteredOwner(owner); onRegistered?.(); }
    } catch { /* 인라인 오류와 재시도 버튼으로 복구한다. */ }
  };
  const next = async () => {
    if (nextLock.current || !registeredOwner || registeredOwner !== useAuthStore.getState().userUuid || !useAuthStore.getState().isLoggedIn) return;
    nextLock.current = true; setFinishing(true);
    try {
      if (!isUpdate) await useAuthStore.getState().updateUserStatus('ACTIVE');
      if (mounted.current && registeredOwner === useAuthStore.getState().userUuid && useAuthStore.getState().isLoggedIn) {
        if (isUpdate) returnToGrowth();
        else router.replace('/(main)');
      }
    } finally { nextLock.current = false; if (mounted.current) setFinishing(false); }
  };
  const compact = height < 720 || fontScale > 1.2;
  const wide = width > height;
  const instruction = scan.phase === 'positioning' ? '밝은 곳에서 얼굴과 어깨를 맞춰주세요.' : scan.phase === 'countdown' ? `${scan.countdown}초 뒤에 시작해요. 정면을 봐주세요.` : scan.phase === 'finalizing' ? '영상을 기기에 저장하고 있어요.' : scan.currentDirection.guideMessage;

  const controls = <View style={styles.controls}>
    <Text style={styles.captureTitle}>{scan.phase === 'positioning' ? '촬영 준비' : scan.phase === 'countdown' ? '곧 시작해요' : scan.phase === 'finalizing' ? '촬영을 마무리해요' : `${scan.currentDirectionIndex + 1}/${SCAN_DIRECTIONS.length} · ${scan.currentDirection.label}`}</Text>
    <Text style={styles.captureCopy}>{instruction}</Text>
    {scan.phase !== 'finalizing' && <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: scan.matching ? '#5AE6E0' : '#F8D9A0' }]}>{scan.cameraReady ? scan.feedback : '카메라를 준비하고 있어요.'}</Text>}
    {scan.phase === 'scanning' && <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(scan.stageProgress * 100) }} accessibilityLabel="현재 촬영 구간" style={styles.track}><View style={[styles.fill, { width: `${scan.stageProgress * 100}%` }]} /></View>}
    {scan.phase === 'positioning' && <Action title="3초 뒤 촬영 시작" disabled={!scan.cameraReady || !scan.matching} onPress={scan.beginCountdown} />}
    {scan.phase === 'finalizing' && <ActivityIndicator color="#5AE6E0" />}
    <Action title="촬영 취소" secondary onPress={() => scan.cancelScan()} />
  </View>;

  return <View style={[styles.page, contentContainerStyle, { backgroundColor: colors.background.primary }]}>
    {isUpdate && <GrowSubScreenHeader title="얼굴 데이터" disabled={upload.isUploading} onBack={returnToGrowth} />}
    <ScrollView style={styles.introScroll} contentContainerStyle={styles.intro} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{registeredOwner ? isUpdate ? '얼굴 영상을 보냈어요' : '트윈을 준비하고 있어요' : isUpdate ? '트윈의 얼굴 다시 담기' : '나의 아바타 만들기'}</Text>
      <Text style={[styles.description, { color: colors.text.secondary }]}>{registeredOwner ? isUpdate ? '얼굴 학습을 요청했어요. 새 얼굴이 반영되기까지 시간이 걸릴 수 있어요.' : '영상이 등록됐어요. 트윈이 완성되기까지 조금 시간이 필요해요.' : scan.videoUri ? isUpdate ? '촬영을 마쳤어요. 이 영상으로 얼굴 학습을 요청할까요?' : '촬영을 마쳤어요. 이 영상을 트윈 만들기에 사용할까요?' : '짧은 영상으로 나다운 얼굴과 움직임을 담아요.\n약 20~25초면 충분해요.'}</Text>
      {!compact && <View style={[styles.summary, { backgroundColor: colors.background.card }]}>
        <Text style={[styles.summaryText, { color: colors.text.primary }]}>{registeredOwner ? isUpdate ? '새 결과가 준비되면 트윈에 반영돼요.' : '먼저 상대를 둘러보며 시작해보세요.' : '편안한 정면 → 미소 → 말하기 → 좌우 → 정면'}</Text>
        <Text style={[styles.description, { color: colors.text.secondary }]}>{scan.videoUri ? '촬영이 불편했다면 다시 촬영할 수 있어요.' : '어깨까지 보이게 · 소리는 저장하지 않아요'}</Text>
      </View>}
      {isUpdate && <Text style={[styles.description, { color: colors.text.secondary }]}>새 결과가 성공하면 기존 얼굴을 교체해요. 학습이 실패하면 기존 얼굴은 유지돼요. 공개 프로필 사진은 바뀌지 않아요.</Text>}
      {(scan.error || upload.error) && <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.text.danger }]}>{scan.error || upload.error}</Text>}
      {scan.error?.includes('권한') && <Pressable accessibilityRole="button" onPress={() => { void Linking.openSettings().catch(() => {}); }} style={styles.infoButton}><Text style={[styles.infoText, { color: colors.text.primary }]}>기기 설정 열기</Text></Pressable>}
    </ScrollView>
    <ScrollView style={styles.footerScroll} contentContainerStyle={styles.footer} showsVerticalScrollIndicator={false}>
      {upload.isUploading && <Text accessibilityLiveRegion="polite" style={[styles.description, { color: colors.text.secondary }]}>{upload.stage === 'save' ? '서버에 등록을 확인하고 있어요…' : upload.progress === null ? '영상을 보낼 준비를 하고 있어요…' : `영상 전송 ${Math.floor(upload.progress * 100)}%`}</Text>}
      {upload.requiresLogin ? <Action title="다시 로그인하여 확인" onPress={() => { void useAuthStore.getState().logout().then(() => { if (mounted.current) router.replace('/login'); }); }} /> : registeredOwner ? <Action title={finishing ? '시작하는 중…' : isUpdate ? '성장으로 돌아가기' : '상대 둘러보기'} disabled={finishing} onPress={() => { void next(); }} /> : scan.videoUri ? <>
        <Action title={upload.isUploading ? '영상 등록 중…' : upload.error ? '등록 다시 시도' : isUpdate ? '얼굴 학습 요청하기' : '영상 등록하기'} disabled={upload.isUploading} onPress={() => { void register(); }} />
        <Pressable accessibilityRole="button" disabled={upload.isUploading} onPress={() => { upload.clearError(); void scan.startScan(); }} style={styles.infoButton}><Text style={[styles.infoText, { color: colors.text.secondary, opacity: upload.isUploading ? 0.45 : 1 }]}>다시 촬영</Text></Pressable>
      </> : <Action title="카메라 열기" onPress={() => { void scan.startScan(); }} />}
      <Pressable accessibilityRole="button" onPress={() => setShowInfo(true)} style={styles.infoButton}><Text style={[styles.infoText, { color: colors.text.secondary }]}>촬영 방법과 영상 사용 안내</Text></Pressable>
    </ScrollView>

    <Modal visible={captureOpen} animationType="fade" presentationStyle="fullScreen" supportedOrientations={['portrait']} onRequestClose={() => scan.cancelScan()}>
      <SafeAreaView style={styles.capture}>
        <View style={[styles.captureContent, wide && styles.captureWide]}>
          <View style={styles.cameraSpace} onLayout={event => setAvailable(event.nativeEvent.layout)}>
            <View style={[styles.cameraFrame, { width: preview.width, height: preview.height }]}>
              {device && captureOpen && <FaceCameraView key={scan.captureId} ref={scan.cameraRef} device={device} format={format} fps={format ? Math.max(format.minFps, Math.min(30, format.maxFps)) : undefined} videoBitRate={3} outputOrientation="preview" resizeMode="cover" isActive={captureOpen} frameProcessor={frameProcessor} onStarted={scan.onCameraStarted} onError={scan.onCameraError} />}
              <FaceGuideOverlay matching={scan.matching} />
              {scan.phase === 'countdown' && <View pointerEvents="none" style={styles.countdown}><Text style={styles.countdownText}>{scan.countdown}</Text></View>}
            </View>
          </View>
          {/* 보통 크기에서는 스크롤 없이 표시. 큰 접근성 글꼴에서는 버튼을 숨기지 않도록 별도 영역만 스크롤한다. */}
          {fontScale > 1.4 || height < 600 ? <ScrollView style={[styles.accessibleControls, wide && styles.wideControls]} contentContainerStyle={styles.controlsContent}>{controls}</ScrollView> : <View style={wide ? styles.wideControls : undefined}>{controls}</View>}
        </View>
      </SafeAreaView>
    </Modal>

    <Modal visible={showInfo} transparent animationType="fade" onRequestClose={() => setShowInfo(false)}>
      <SafeAreaView style={styles.infoBackdrop}><View style={[styles.infoCard, { backgroundColor: colors.background.card }]}>
        <ScrollView contentContainerStyle={styles.infoContent}>
          <Text style={[styles.title, { color: colors.text.primary }]}>편하게 촬영해주세요</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>밝고 흔들림 없는 곳에서 휴대폰을 눈높이에 두세요. 얼굴과 양쪽 어깨가 보이도록 조금 떨어져주세요.{ '\n\n' }정면에서 편하게 있다가 살짝 웃고, 짧은 문장을 말해주세요. 마지막으로 고개를 좌우로 조금 돌리면 돼요. 구도를 맞추는 시간에 따라 촬영이 조금 길어질 수 있어요.{ '\n\n' }이 영상은 AI 트윈의 얼굴을 만드는 데 사용돼요. 공개 프로필 사진과는 별개이며, 소리는 저장하지 않아요. 미소와 말하는 모습은 안내에 따라 촬영하며, 어깨 포함 여부나 실제 발화를 자동으로 확인하는 기능은 없어요.</Text>
        </ScrollView>
        <Action title="확인했어요" onPress={() => setShowInfo(false)} />
      </View></SafeAreaView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 24, paddingTop: 16, width: '100%', alignSelf: 'center' },
  introScroll: { flex: 1 }, intro: { gap: 12, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  description: { fontSize: 15, lineHeight: 23 }, summary: { borderRadius: 20, padding: 20, gap: 12, marginTop: 12 }, summaryText: { fontSize: 15, lineHeight: 24 },
  footerScroll: { flexGrow: 0, flexShrink: 1, maxHeight: '55%' },
  footer: { gap: 8, paddingBottom: 8 },
  action: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#5AE6E0', justifyContent: 'center' },
  actionText: { color: '#102024', fontSize: 16, lineHeight: 23, textAlign: 'center', fontWeight: '600' },
  secondaryAction: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#7B8996' }, secondaryText: { color: '#FFFFFF' },
  infoButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', padding: 8 }, infoText: { fontSize: 14, lineHeight: 21, textAlign: 'center' }, error: { color: '#DD8352', fontSize: 14, lineHeight: 22 },
  capture: { flex: 1, backgroundColor: '#10171C' }, captureContent: { flex: 1, padding: 12, gap: 12 }, captureWide: { flexDirection: 'row' },
  cameraSpace: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cameraFrame: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#26333C' },
  controls: { paddingHorizontal: 8, gap: 8 }, controlsContent: { paddingVertical: 8 }, accessibleControls: { maxHeight: '48%', flexGrow: 0 }, wideControls: { flex: 1, justifyContent: 'center', maxHeight: '100%' },
  captureTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', lineHeight: 26 }, captureCopy: { color: '#E6EDF3', fontSize: 15, lineHeight: 23 }, feedback: { fontSize: 13, lineHeight: 20 },
  track: { height: 5, borderRadius: 3, backgroundColor: '#3A4B56', overflow: 'hidden' }, fill: { height: '100%', backgroundColor: '#5AE6E0' },
  countdown: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }, countdownText: { color: '#FFFFFF', fontSize: 64, fontWeight: '700' },
  infoBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }, infoCard: { maxHeight: '85%', padding: 20, borderRadius: 24, gap: 16 }, infoContent: { gap: 16, paddingBottom: 8 },
});
