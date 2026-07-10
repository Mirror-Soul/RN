import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProfileHeader } from './components/ProfileHeader';
import { AvailableTimeCard } from './components/AvailableTimeCard';
import { SettingsSection } from './components/SettingsSection';
import { PROFILE_SECTIONS } from './constants/profileMenu';
import { TimeRefillBottomSheet } from './components/TimeRefillBottomSheet';

import { useAccountStore } from '@/src/store/useAccountStore';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

export const ProfileScreen = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { nickname } = useAccountStore();

  const handleOpenSheet = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  return (
    <>
      <ScreenLayout 
        withScroll={true} 
        contentContainerStyle={styles.scrollContent}
        paddingBottomOffset={100}
      >
        <ProfileHeader 
          name={nickname} 
          email="user@example.com" 
          delay={0}
        />
        
        <AvailableTimeCard 
          timeString="02:30:00" 
          delay={100}
          onPressRefill={handleOpenSheet}
        />
        
        {PROFILE_SECTIONS.map((section, index) => (
          <SettingsSection 
            key={section.id} 
            section={section} 
            delay={200 + (index * 100)}
          />
        ))}
      </ScreenLayout>

      <TimeRefillBottomSheet isOpen={isSheetOpen} onClose={handleCloseSheet} />
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
  }
});
