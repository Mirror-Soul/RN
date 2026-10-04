import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
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
  const { colors, palette } = useMatchingDesign();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
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
      {url && !failed ? (
        <Image
          accessibilityLabel={`${name} 프로필 사진`}
          source={{ uri: url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text
          maxFontSizeMultiplier={1.6}
          accessibilityLabel={
            url ? '사진을 불러오지 못해 기본 아바타로 표시' : '기본 아바타'
          }
          style={[styles.initial, { color: colors.brand.accent }]}
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
