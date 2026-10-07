import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import FaceCaptureScreen from '@/src/components/signup/steps/Step5_FaceScan/FaceCaptureScreen';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function FaceDataUpdateScreen() {
  const { colors } = useThemeColors();
  const client = useQueryClient();
  const owner = useAuthStore(state => state.userUuid);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
    <FaceCaptureScreen key={owner} mode="update" onRegistered={() => {
      void client.invalidateQueries({ queryKey: ['growth'] });
      void client.invalidateQueries({ queryKey: ['profile'] });
    }} />
  </SafeAreaView>;
}
