import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { JobVerificationForm } from '@/src/features/job-verification/JobVerificationForm';

export default function JobVerificationsScreen() {
  const { colors } = useThemeColors(); const router = useRouter();
  const owner = useAuthStore(s => s.userUuid);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
    <JobVerificationForm key={owner} onClose={() => router.canGoBack() ? router.back() : router.replace('/(main)/grow')} />
  </SafeAreaView>;
}
