import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileHeader } from './components/ProfileHeader';
import { AvailableTimeCard } from './components/AvailableTimeCard';
import { SettingsSection } from './components/SettingsSection';
import { FooterActions } from './components/FooterActions';
import { PROFILE_SECTIONS } from './constants/profileMenu';

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();

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
          name="김소울" 
          email="kim@example.com" 
          delay={0}
        />
        
        <AvailableTimeCard 
          timeString="02:30:00" 
          delay={100}
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
