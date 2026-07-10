import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

import { DeleteWarningSection } from './components/DeleteWarningSection';
import { DeleteConsentSection } from './components/DeleteConsentSection';
import { DeleteConfirmBottomSheet } from './components/DeleteConfirmBottomSheet';

export const AccountDeleteScreen = () => {
  const { colors } = useThemeColors();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);

  const toggleConsent = () => setIsConsentChecked(!isConsentChecked);

  const handleOpenConfirm = () => {
    if (!isConsentChecked) return;
    setIsConfirmSheetOpen(true);
  };

  const handleCloseConfirm = () => setIsConfirmSheetOpen(false);

  const performDeleteAccount = () => {
    console.log('Soft Delete API 호출 및 로그아웃 처리');
    setIsConfirmSheetOpen(false);
    // TODO: useAuthStore().logout(), Delete API 호출 등
  };

  return (
    <ScreenLayout withScroll={true}>
      <Header title="회원 탈퇴" delay={0} />

      <View style={styles.content}>
        <DeleteWarningSection />
      </View>

      <DeleteConsentSection 
        isAgreed={isConsentChecked}
        onToggleAgree={toggleConsent}
        onSubmit={handleOpenConfirm}
      />

      <DeleteConfirmBottomSheet
        isOpen={isConfirmSheetOpen}
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
