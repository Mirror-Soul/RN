import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileHeader } from './components/ProfileHeader';
import { AvailableTimeCard } from './components/AvailableTimeCard';
import { SettingsSection } from './components/SettingsSection';
import { FooterActions } from './components/FooterActions';
import { PROFILE_SECTIONS } from './constants/profileMenu';
import { TimeRefillBottomSheet } from './components/TimeRefillBottomSheet';

import { useAccountStore } from '@/src/store/useAccountStore';

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { nickname } = useAccountStore();

  const handleOpenSheet = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
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

        <FooterActions delay={400} />
      </ScrollView>

      {/* Render Bottom Sheet outside of ScrollView so it overlaps correctly */}
      <TimeRefillBottomSheet isOpen={isSheetOpen} onClose={handleCloseSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  }
});
