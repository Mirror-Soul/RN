import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { ChatRoom } from '../../types';

interface OptionsProfileSectionProps {
  room: ChatRoom;
}

export function OptionsProfileSection({ room }: OptionsProfileSectionProps) {
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarMargin}>
        <LinearGradient
          colors={Colors.gradient.twinCallButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.largeAvatar}
        >
          <Text style={styles.largeAvatarText}>{room.avatarLetter}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.profileName}>{room.name}</Text>
      <View style={styles.profileMetaRow}>
        <Text style={styles.profileMeta}>유사도 {room.resonance}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    paddingBottom: Spacing.xxxl,
  },
  avatarMargin: {
    paddingBottom: Spacing.lg,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 8,
  },
  largeAvatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0.4,
    color: Colors.neutral.pureWhite,
  },
  profileName: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xl,
    lineHeight: 28,
    letterSpacing: -0.44,
    color: Colors.neutral.pureWhite,
  },
  profileMetaRow: {
    paddingTop: Spacing.xs,
  },
  profileMeta: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    color: Colors.neutral.darkGray,
  },
});
