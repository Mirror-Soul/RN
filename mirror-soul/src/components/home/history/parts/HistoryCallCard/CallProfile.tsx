import { Colors, Radii } from '@/src/constants/theme';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export interface CallProfileProps {
  name: string;
  age: number;
  consistencyPercent: number;
  dateStr: string; // ex) "오늘", "어제", "10.24"
  timeStr: string; // ex) "14:30"
  profileImageUrl?: string;
  callTypeDesc: string; // ex) "내가 시작한 통화", "상대방이 시작한 통화"
}

export default function CallProfile({
  name,
  age,
  consistencyPercent,
  dateStr,
  timeStr,
  profileImageUrl,
  callTypeDesc,
}: CallProfileProps) {
  const theme = useAnimatedTheme();

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.profileImageWrapper}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
        ) : (
          <Animated.View style={[styles.profileImage, theme.animatedGlassBackground]} />
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoWrapper}>
        <View style={styles.nameAgeRow}>
          <Animated.Text style={[styles.nameAgeText, theme.animatedText]}>{name}, {age}</Animated.Text>
          <View style={styles.consistencyBadgeWrapper}>
            <LinearGradient
              colors={['rgba(0, 211, 243, 0.20)', 'rgba(194, 122, 255, 0.20)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.consistencyBadge}
            >
              <Text style={styles.consistencyText}>{consistencyPercent}%</Text>
            </LinearGradient>
          </View>
        </View>
        <Animated.Text style={[styles.typeDescText, theme.animatedTextSecondary]}>{callTypeDesc}</Animated.Text>
      </View>

      {/* Date / Time */}
      <View style={styles.dateWrapper}>
        <Animated.Text style={[styles.dateText, theme.animatedTextSecondary]}>{dateStr}</Animated.Text>
        <Animated.Text style={[styles.timeText, theme.animatedTextMuted]}>{timeStr}</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  profileImageWrapper: {
    width: 48,
    height: 48,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
  },
  infoWrapper: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameAgeText: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 27, // 150%
    letterSpacing: -0.439,
  },
  consistencyBadgeWrapper: {
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: 'rgba(0, 211, 243, 0.30)',
    overflow: 'hidden',
  },
  consistencyBadge: {
    paddingHorizontal: 8.6,
    paddingVertical: 3.5, // 근사치 4.4 - 0.6 = 3.8
    justifyContent: 'center',
    alignItems: 'center',
  },
  consistencyText: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
  },
  typeDescText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  dateWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  dateText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'right',
  },
  timeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'right',
  },
});
