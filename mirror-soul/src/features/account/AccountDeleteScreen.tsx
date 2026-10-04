import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

import { DeleteWarningSection } from './components/DeleteWarningSection';
import { DeleteConsentSection } from './components/DeleteConsentSection';
import { DeleteConfirmBottomSheet } from './components/DeleteConfirmBottomSheet';
import { useDeleteAccountMutation } from './hooks/useDeleteAccountMutation';
import { performLogout } from '@/src/services/authService';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { useAuthStore } from '@/src/store/useAuthStore';

export const AccountDeleteScreen = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccountMutation();
  const isDeletingRef = useRef(false);
  const confirmUser = useRef<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const busy = deleteAccountMutation.isPending || isFinishing;
  useEffect(() => {
    if (!busy) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => listener.remove();
  }, [busy]);

  const toggleConsent = () => setIsConsentChecked(!isConsentChecked);

  const handleOpenConfirm = () => {
    if (!isConsentChecked || isDeletingRef.current) return;
    confirmUser.current = useAuthStore.getState().userUuid;
    setIsConfirmSheetOpen(true);
  };

  const handleCloseConfirm = () => { if (!isDeletingRef.current) setIsConfirmSheetOpen(false); };

  const performDeleteAccount = async () => {
    // isPending은 리렌더 이후에나 반영되므로, 연타 시 중복 탈퇴 요청을 확실히 막으려면 동기 락이 필요하다.
    if (isDeletingRef.current || !isConsentChecked) return;
    const userUuid = confirmUser.current;
    const session = useAuthStore.getState();
    if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) {
      setIsConfirmSheetOpen(false);
      setIsConsentChecked(false);
      showToast('계정이 변경됐어요. 탈퇴 안내를 다시 확인해 주세요.', 'error');
      return;
    }
    isDeletingRef.current = true;
    setIsFinishing(true);
    try {
      await deleteAccountMutation.mutateAsync();
    } catch (error) {
      setIsConfirmSheetOpen(false);
      showToast(getErrorDisplayMessage(error, '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.'), 'error');
      isDeletingRef.current = false;
      setIsFinishing(false);
      return;
    }

    if (!useAuthStore.getState().isLoggedIn || useAuthStore.getState().userUuid !== userUuid) {
      setIsConfirmSheetOpen(false);
      setIsFinishing(false);
      isDeletingRef.current = false;
      return;
    }

    // 탈퇴 자체는 이미 성공했으므로, 이후 로그아웃 처리(performLogout)가 예상치 못한 이유로
    // 실패하더라도 로그인 화면 이동은 항상 보장한다 (탈퇴 성공 후 화면에 머무는 것을 방지)
    try {
      await performLogout();
    } catch {
      // 탈퇴는 이미 완료됐다. 로컬 정리 예외로 화면 이동을 막지 않는다.
    } finally {
      setIsConfirmSheetOpen(false);
      isDeletingRef.current = false;
      router.replace('/login');
    }
  };

  return (
    <ScreenLayout withScroll={true}>
      <Header title="회원 탈퇴" delay={0} onBackPress={() => { if (!isDeletingRef.current) { if (router.canGoBack()) router.back(); else router.replace('/(main)/account'); } }} />

      <View style={styles.content}>
        <DeleteWarningSection />
      </View>

      <DeleteConsentSection 
        isAgreed={isConsentChecked}
        onToggleAgree={toggleConsent}
        onSubmit={handleOpenConfirm}
        disabled={busy}
      />

      <DeleteConfirmBottomSheet
        isOpen={isConfirmSheetOpen}
        isConfirming={busy}
        onClose={handleCloseConfirm}
        onConfirm={performDeleteAccount}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
