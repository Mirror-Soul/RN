import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRetryableProfileImage } from '@/src/features/profile/photo/useRetryableProfileImage';
import { ProfilePhotoImage } from '@/src/features/profile/photo/ProfilePhotoImage';
import { FontFamily, FontSize, FontWeight, Radii } from '@/src/constants/theme';
import {
  useMatchingDesign,
  MatchingText as Text,
} from '@/src/features/match/components/MatchingDesign';

export function MatchAvatar({
  name,
  url,
  size = 56,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  const { palette } = useMatchingDesign();
  const photo = useRetryableProfileImage(url);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          backgroundColor: palette.tint,
          borderColor: palette.tint,
        },
      ]}
    >
      {url && !photo.failed ? (
        <ProfilePhotoImage
          key={photo.imageKey}
          accessibilityLabel={`${name} 프로필 사진`}
          source={{ uri: url }}
          style={StyleSheet.absoluteFill}
          cachePolicy="disk"
          onError={photo.onError}
        />
      ) : photo.failed ? (
        <Pressable onPress={() => { void photo.retry(); }} disabled={photo.isReloading} accessibilityRole="button"
          accessibilityLabel={`${name} 프로필 사진 다시 불러오기`} accessibilityState={{ busy: photo.isReloading }}
          style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Feather name="refresh-cw" size={Math.min(20, size / 2)} color={palette.accentInk} />
        </Pressable>
      ) : (
        <Text
          variant="heading"
          maxFontSizeMultiplier={1.6}
          accessibilityLabel={
            url ? '사진을 불러오지 못해 기본 아바타로 표시' : '기본 아바타'
          }
          style={[styles.initial, { color: palette.accentInk }]}
        >
          {name.trim().charAt(0) || '?'}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  avatar: {
    borderRadius: Radii.full,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initial: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
  },
});
