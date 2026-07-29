import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailableTimeCard } from '../profile/components/AvailableTimeCard';
import { SettingsSection } from '../profile/components/SettingsSection';
import { TimeRefillBottomSheet } from '../profile/components/TimeRefillBottomSheet';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { useProfileSections } from '../profile/constants/profileMenu';
import { Spacing } from '@/src/constants/theme';
import { useCallTimeStore } from '@/src/store/useCallTimeStore';


export const ProfileSettingsScreen = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const profileSections = useProfileSections();
  const fetchRemainingTime = useCallTimeStore((state) => state.fetchRemainingTime);

  useEffect(() => {
    fetchRemainingTime();
  }, [fetchRemainingTime]);

  const handleOpenSheet = useCallback(() => setIsSheetOpen(true), []);
  const handleCloseSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <>
      <ScreenLayout withScroll={true}>
        <Header title="공간 관리 및 설정" delay={0} />

        <View style={styles.content}>
          {/* 대화 가능 시간 카드 (미지정 시 useCallTimeStore 값 사용) */}
          <AvailableTimeCard
            delay={80}
            onPressRefill={handleOpenSheet}
          />

          {/* 서비스 설정 섹션 목록 */}
          {profileSections.map((section, index) => (
            <SettingsSection
              key={section.id}
              section={section}
              delay={140 + index * 80}
            />
          ))}
        </View>
      </ScreenLayout>

      <TimeRefillBottomSheet isOpen={isSheetOpen} onClose={handleCloseSheet} />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
});
