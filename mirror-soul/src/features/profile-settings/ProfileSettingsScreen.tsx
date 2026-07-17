import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailableTimeCard } from '../profile/components/AvailableTimeCard';
import { SettingsSection } from '../profile/components/SettingsSection';
import { TimeRefillBottomSheet } from '../profile/components/TimeRefillBottomSheet';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { useProfileSections } from '../profile/constants/profileMenu';

export const ProfileSettingsScreen = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const profileSections = useProfileSections();

  const handleOpenSheet = useCallback(() => setIsSheetOpen(true), []);
  const handleCloseSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <>
      <ScreenLayout withScroll={true}>
        <Header title="공간 관리 및 설정" delay={0} />

        <View style={styles.content}>
          {/* 대화 가능 시간 카드 */}
          <AvailableTimeCard
            timeString="02:30:00"
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
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});
