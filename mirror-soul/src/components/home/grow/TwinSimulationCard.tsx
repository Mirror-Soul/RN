import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/store/useAuthStore';
import CallStartConfirmSheet from '@/src/components/call/CallStartConfirmSheet';
import { TimeRefillBottomSheet } from '@/src/features/profile/components/TimeRefillBottomSheet';
import GrowthMissionCard from './GrowthMissionCard';

export default function TwinSimulationCard({ isReady, isLoading, isError, onRetry }: {
  isReady: boolean; isLoading: boolean; isError: boolean; onRetry: () => void;
}) {
  const { colors } = useThemeColors();
  const userUuid = useAuthStore(state => state.userUuid);
  const [sheet, setSheet] = useState<{ kind: 'call' | 'refill'; owner: string } | null>(null);
  const focused = useRef(true);
  const pendingOwner = useRef<string | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearNavigation = useCallback(() => {
    pendingOwner.current = null;
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    navigationTimer.current = null;
  }, []);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    return () => { focused.current = false; clearNavigation(); setSheet(null); };
  }, [clearNavigation]));
  useEffect(() => { clearNavigation(); setSheet(null); }, [userUuid, clearNavigation]);
  const valid = isReady && !isError && !isLoading;
  useEffect(() => { if (!valid) { clearNavigation(); setSheet(null); } }, [valid, clearNavigation]);
  const finishNavigation = () => {
    const owner = pendingOwner.current;
    pendingOwner.current = null;
    const session = useAuthStore.getState();
    if (owner && focused.current && session.isLoggedIn && session.userUuid === owner && valid) router.push('/ai-call');
  };
  const open = () => {
    if (!valid || !userUuid || pendingOwner.current || !focused.current) return;
    setSheet({ kind: 'call', owner: userUuid });
  };
  const start = () => {
    const session = useAuthStore.getState();
    if (!sheet || !valid || pendingOwner.current || !focused.current || !session.isLoggedIn || session.userUuid !== sheet.owner) return;
    pendingOwner.current = sheet.owner;
    setSheet(null);
    // iOS must release the native Modal before opening the full-screen call route.
    if (Platform.OS !== 'ios') navigationTimer.current = setTimeout(finishNavigation, 0);
  };
  const visible = !!sheet && sheet.owner === userUuid && valid;
  return <View style={styles.wrapper}>
    <Text style={[styles.eyebrow, { color: colors.text.secondary }]}>내 트윈과 대화</Text>
    <LinearGradient colors={[Colors.glass.cyan30_d3, Colors.glass.purple30, Colors.glass.pink30]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.border}>
      <GrowthMissionCard title="트윈 시뮬레이션" icon="video" subtitle={isError ? '트윈 상태를 다시 확인해 주세요.' : isLoading ? '트윈이 준비됐는지 확인하고 있어요.' : isReady ? '내 트윈의 얼굴과 목소리, 반응을 직접 확인해 보세요.' : '학습이 반영되면 내 트윈과 대화할 수 있어요.'}
        status={isError ? '다시 확인' : isReady ? '시간 사용' : '준비 중'} onPress={isError || !isReady ? onRetry : open} disabled={isLoading} error={isError} accessibilityLabel={isError || !isReady ? '내 트윈 준비 상태 확인' : '트윈 시뮬레이션 시작'} />
    </LinearGradient>
    <Modal visible={visible} transparent animationType="none" onDismiss={finishNavigation} onRequestClose={() => setSheet(null)}>
      {visible && sheet.kind === 'call' && <CallStartConfirmSheet ownTwin embedded isOpen target={{ userUuid: sheet.owner, name: '내 트윈' }} onClose={() => setSheet(null)} onStart={start} onRefill={() => setSheet({ ...sheet, kind: 'refill' })} />}
      {visible && sheet.kind === 'refill' && <TimeRefillBottomSheet embedded isOpen onClose={() => setSheet(null)} />}
    </Modal>
  </View>;
}
const styles = StyleSheet.create({ wrapper: { alignSelf: 'stretch', gap: 10 }, eyebrow: { fontSize: 12, lineHeight: 20, fontWeight: '500' }, border: { borderRadius: 23, padding: 1 } });
