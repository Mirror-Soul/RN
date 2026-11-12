import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { JobVerificationForm } from '@/src/features/job-verification/JobVerificationForm';
import { useEvidenceDraft } from '@/src/features/job-verification/evidenceDraft';

export default function VerificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { height } = useWindowDimensions(); const insets = useSafeAreaInsets();
  const busy = useEvidenceDraft(s => s.busy);
  return isOpen ? <BottomSheet isOpen onClose={onClose} dragFromHandleOnly dismissible={!busy} height={Math.max(0, height - insets.top - 12)}><JobVerificationForm onClose={onClose} /></BottomSheet> : null;
}
