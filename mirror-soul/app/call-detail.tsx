import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailSummary from '@/src/components/home/history/detail/CallDetailSummary';
import CallDetailHeader from '@/src/components/home/history/detail/CallDetailHeader';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useCallDetail } from '@/src/features/history/hooks/useCallDetail';
import { ProfileImageReloadContext } from '@/src/features/profile/photo/useRetryableProfileImage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Linking, Modal, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import CallStartConfirmSheet, { CallTarget } from '@/src/components/call/CallStartConfirmSheet';
import { TimeRefillBottomSheet } from '@/src/features/profile/components/TimeRefillBottomSheet';
import CallDetailMenu from '@/src/components/home/history/detail/CallDetailMenu';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import type { HistoryMenuAnchor } from '@/src/components/home/history/detail/historyMenuLayout';
import PartnerProfileModal from '@/src/components/home/main/Discovery/PartnerProfileModal';
import type { Recommendation } from '@/src/types/api/home';
import { useBlockUserMutation } from '@/src/features/chat/hooks/useBlockUserMutation';
import { useAuthStore } from '@/src/store/useAuthStore';
import { SUPPORT_EMAIL } from '@/src/features/customer-center/constants/faqData';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 통화 기록 상세 화면 (루트 스택 레벨)
 * HistoryCallCard 탭 시 진입하며, BottomNavbar 없이 풀스크린으로 표시됩니다.
 * 읽기 전용 통화 기록 + Twin 답변 수정 화면입니다. (실시간 채팅 없음)
 */
export default function CallDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contentContainerStyle } = useLayout();
  const { colors } = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const callId = Number(id);
  const isValidCallId = Number.isSafeInteger(callId) && callId > 0;
  const { data, isLoading, isFetching, isError, refetch, updateTalkLog, isSaving } = useCallDetail(callId);

  const { showToast } = useToast();
  const userUuid = useAuthStore(state => state.userUuid);
  const currentUser = useRef(userUuid);
  currentUser.current = userUuid;
  const blockMutation = useBlockUserMutation();
  const blockInFlight = useRef(false);
  const reportInFlight = useRef(false);
  const [reporting, setReporting] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState<Recommendation | null>(null);
  const rootRef = useRef<View>(null);
  const [menuAnchor, setMenuAnchor] = useState<HistoryMenuAnchor | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'call' | 'refill' | null>(null);
  const [headerBottom, setHeaderBottom] = useState(insets.top + 100);
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const navigationInFlight = useRef(false);
  const refreshInFlight = useRef(false);
  const refreshGeneration = useRef(0);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focused = useRef(true);
  const mounted = useRef(true);
  const recordId = useRef(callId);
  recordId.current = callId;
  const target: CallTarget | null = data && UUID_PATTERN.test(data.partner.userUuid)
    ? { userUuid: data.partner.userUuid, name: data.partner.name || '상대방' }
    : null;
  const callDisabled = !target || editing || isSaving || isFetching || refreshing || navigating || blockMutation.isPending || reporting;
  const userActionsDisabled = callDisabled || target?.userUuid === userUuid;
  const measureMenuAnchor = useCallback((anchor: HistoryMenuAnchor) => {
    rootRef.current?.measureInWindow((x, y) => {
      if (mounted.current) setMenuAnchor({ ...anchor, x: anchor.x - x, y: anchor.y - y });
    });
  }, []);

  const cancelPendingNavigation = useCallback(() => {
    if (navigationTimer.current) clearTimeout(navigationTimer.current);
    navigationTimer.current = null;
    navigationInFlight.current = false;
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; cancelPendingNavigation(); };
  }, [cancelPendingNavigation]);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    setNavigating(false);
    return () => {
      focused.current = false;
      cancelPendingNavigation();
      setActiveSheet(null);
      setMenuOpen(false);
      setProfileCandidate(null);
    };
  }, [cancelPendingNavigation]));
  useEffect(() => {
    cancelPendingNavigation();
    setNavigating(false);
    setActiveSheet(null);
    setMenuOpen(false);
    setProfileCandidate(null);
    setMenuAnchor(null);
    setEditing(false);
    refreshGeneration.current += 1;
    refreshInFlight.current = false;
    setRefreshing(false);
  }, [callId, cancelPendingNavigation]);
  useEffect(() => {
    if (!data || isError) {
      cancelPendingNavigation();
      setNavigating(false);
      setActiveSheet(null);
      setMenuOpen(false);
      setProfileCandidate(null);
    }
  }, [data, isError, cancelPendingNavigation]);

  const handleCallPress = () => {
    if (callDisabled || navigationInFlight.current || !focused.current) return;
    Keyboard.dismiss();
    setMenuOpen(false);
    setActiveSheet('call');
  };
  const handleMorePress = () => {
    if (activeSheet || profileCandidate || navigationInFlight.current || blockInFlight.current) return;
    Keyboard.dismiss();
    setMenuOpen(open => !open);
  };
  const handleStartCall = (callTarget: CallTarget, isPreview: boolean, remainingSeconds?: number) => {
    if (navigationInFlight.current || !focused.current || editing || isSaving || blockInFlight.current || reportInFlight.current) return;
    if (!target || callTarget.userUuid !== target.userUuid || isPreview || !Number.isFinite(remainingSeconds) || (remainingSeconds ?? 0) <= 0) {
      setActiveSheet(null);
      showToast('통화 정보를 다시 확인한 뒤 시도해주세요.', 'error');
      return;
    }
    navigationInFlight.current = true;
    setNavigating(true);
    setActiveSheet(null);
    setProfileCandidate(null);
    const sourceCallId = callId;
    // Release the single native confirmation Modal before presenting the call route.
    navigationTimer.current = setTimeout(() => {
      navigationTimer.current = null;
      if (!mounted.current || !focused.current || recordId.current !== sourceCallId) return;
      router.push({ pathname: '/ai-call', params: {
        targetUuid: callTarget.userUuid,
        targetName: callTarget.name,
        remainingSeconds: String(remainingSeconds),
      } });
    }, 280);
  };
  const handleProfile = () => {
    if (userActionsDisabled || !data || !target) return;
    setMenuOpen(false);
    setProfileCandidate({ userUuid: target.userUuid, name: target.name, age: data.partner.age, profileImageUrl: data.partner.profileImageUrl,
      job: null, jobCertificationSubmitted: false, residence: null, selfIntroduction: null, mbti: null, personalityTags: [], recommendationScore: 0 });
  };
  const handleBlock = () => {
    if (userActionsDisabled || !target || blockInFlight.current) return;
    const sourceCallId = callId;
    const sourceUser = userUuid;
    const capturedTarget = target;
    Alert.alert(`${target.name}님을 차단할까요?`, '서로 추천과 메시지 목록에 표시되지 않고 새 통화를 할 수 없어요. 이 상대와의 통화 기록은 숨겨지고, 대기 중인 만남 신청은 거절돼요.', [
      { text: '취소', style: 'cancel' },
      { text: '차단하기', style: 'destructive', onPress: () => {
        if (blockInFlight.current || !mounted.current || !focused.current || recordId.current !== sourceCallId || currentUser.current !== sourceUser) return;
        blockInFlight.current = true;
        setMenuOpen(false);
        void blockMutation.mutateAsync(capturedTarget.userUuid).then(() => {
          if (!mounted.current || !focused.current || recordId.current !== sourceCallId || currentUser.current !== sourceUser) return;
          showToast('사용자를 차단했어요.', 'success');
          router.replace('/(main)/history');
        }).catch(error => {
          if (mounted.current && focused.current && recordId.current === sourceCallId && currentUser.current === sourceUser) showToast(getErrorDisplayMessage(error, '차단하지 못했어요. 다시 시도해주세요.'), 'error');
        }).finally(() => { blockInFlight.current = false; });
      } },
    ]);
  };
  const handleReport = async (reason: string): Promise<boolean> => {
    if (userActionsDisabled || !target || reportInFlight.current) return false;
    reportInFlight.current = true;
    setReporting(true);
    const sourceCallId = callId;
    const sourceUser = userUuid;
    const body = `신고 대상: ${target.name}\n사용자 UUID: ${target.userUuid}\n통화 기록 ID: ${callId}\n신고 사유: ${reason}\n\n상황을 설명해주세요:\n`;
    try {
      // Open a user-controlled draft only. No report API or automatic email send exists.
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('[MirrorSoul] 사용자 신고')}&body=${encodeURIComponent(body)}`);
      return mounted.current && recordId.current === sourceCallId && currentUser.current === sourceUser;
    } catch {
      if (mounted.current && recordId.current === sourceCallId && currentUser.current === sourceUser) showToast('메일 앱을 열지 못했어요. 메일 계정 설정을 확인하거나 안내된 주소로 문의해주세요.', 'error');
      return false;
    } finally {
      reportInFlight.current = false;
      if (mounted.current) setReporting(false);
    }
  };
  const handleRefresh = async () => {
    if (editing || isSaving || refreshInFlight.current || navigationInFlight.current || blockInFlight.current || reportInFlight.current) return;
    Keyboard.dismiss();
    setMenuOpen(false);
    refreshInFlight.current = true;
    setRefreshing(true);
    const sourceCallId = callId;
    const sourceGeneration = refreshGeneration.current;
    try {
      const result = await refetch();
      if (result.isError && mounted.current && focused.current && recordId.current === sourceCallId) {
        showToast(getErrorDisplayMessage(result.error, '기록을 다시 불러오지 못했어요.'), 'error');
      }
    } catch (error) {
      if (mounted.current && focused.current && recordId.current === sourceCallId) {
        showToast(getErrorDisplayMessage(error, '기록을 다시 불러오지 못했어요.'), 'error');
      }
    } finally {
      if (refreshGeneration.current === sourceGeneration) {
        refreshInFlight.current = false;
        if (mounted.current) setRefreshing(false);
      }
    }
  };

  // 히스토리가 없는 상태(딥링크/푸시 알림으로 바로 진입 등)에서 router.back()은 아무 동작도
  // 안 할 수 있다 — 공용 Header의 내부 fallback과 동일한 안전장치를 여기(Header를 안 쓰는
  // 화면)에도 맞춰준다.
  const handleSafeBack = () => {
    cancelPendingNavigation();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/history');
    }
  };

  // callId 자체가 잘못된 경로면 재시도로 복구할 방법이 없으므로, 네트워크 에러(재시도 가능)와
  // 구분해 뒤로가기만 안내한다.
  if (!isValidCallId) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text.muted }]}>잘못된 통화 기록입니다.</Text>
        <TouchableOpacity onPress={handleSafeBack} accessibilityRole="button" accessibilityLabel="뒤로가기" style={styles.recoveryButton}>
          <Text style={[styles.errorText, styles.retryText]}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.primary.electricCyan} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background.primary, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text.muted }]}>통화 기록을 불러오지 못했습니다.</Text>
        <TouchableOpacity onPress={() => { void refetch(); }} disabled={isFetching} accessibilityRole="button" accessibilityLabel="다시 시도" style={styles.recoveryButton}>
          <Text style={[styles.errorText, styles.retryText]}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSafeBack} accessibilityRole="button" accessibilityLabel="기록으로 돌아가기" style={styles.recoveryButton}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>기록으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ProfileImageReloadContext.Provider value={refetch}><View ref={rootRef} collapsable={false} style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.contentWrapper, contentContainerStyle]} accessibilityElementsHidden={menuOpen} importantForAccessibility={menuOpen ? 'no-hide-descendants' : 'auto'}>
        <View style={{ paddingLeft: insets.left, paddingRight: insets.right }} onLayout={event => setHeaderBottom(event.nativeEvent.layout.height)}>
          <CallDetailHeader
            name={data.partner.name}
            profileImageUrl={data.partner.profileImageUrl}
            description={data.description}
            callNumber={data.callNumber}
            onCallPress={handleCallPress}
            onMorePress={handleMorePress}
            onBack={handleSafeBack}
            callDisabled={callDisabled}
            callBusy={navigating}
            menuExpanded={menuOpen}
            onMenuAnchorChange={measureMenuAnchor}
          />
        </View>
        <CallDetailBody
          key={data.callId}
          summary={<CallDetailSummary data={data} refreshFailed={isError} />}
          talkLogs={data.talkLogs}
          partnerName={data.partner.name}
          onSaveTalkLog={updateTalkLog}
          isSaving={isSaving}
          onEditingChange={setEditing}
        />
      </View>
      <CallDetailMenu isOpen={menuOpen} data={data} anchor={menuAnchor} headerBottom={headerBottom} onClose={() => setMenuOpen(false)}
        onRefresh={handleRefresh} onProfile={handleProfile} onBlock={handleBlock} onReport={handleReport} userActionsDisabled={userActionsDisabled} reporting={reporting}
        editing={editing || isSaving} refreshing={refreshing || isFetching} />
      <PartnerProfileModal source="history" match={profileCandidate} onClose={() => setProfileCandidate(null)} onStartCall={handleStartCall} />
      <Modal visible={activeSheet !== null} transparent animationType="none" statusBarTranslucent onRequestClose={() => setActiveSheet(null)}>
        {activeSheet === 'call' && <CallStartConfirmSheet embedded target={target} isOpen
          onClose={() => setActiveSheet(null)} onStart={handleStartCall} onRefill={() => setActiveSheet('refill')} />}
        {activeSheet === 'refill' && <TimeRefillBottomSheet embedded isOpen onClose={() => setActiveSheet(null)} />}
      </Modal>
    </View></ProfileImageReloadContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recoveryButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 20 },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: 24,
  },
  contentWrapper: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
  },
  retryText: {
    color: Colors.primary.electricCyan,
    fontWeight: FontWeight.semibold,
  },
});
