import { Colors, Radii } from '@/src/constants/theme';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import Animated from 'react-native-reanimated';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface CallTagRowProps {
  tags: string[];
}

export default function CallTagRow({ tags }: CallTagRowProps) {
  const theme = useAnimatedTheme();

  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.titleText, theme.animatedTextSecondary]}>대화 주제</Animated.Text>
      <View style={styles.tagsWrapper}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'stretch',
  },
  titleText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
  },
  tagsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    alignSelf: 'stretch',
  },
  tagBadge: {
    paddingHorizontal: 8.6,
    paddingVertical: 2, // 상하 패딩 원본 패딩을 근사
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: 'rgba(194, 122, 255, 0.20)',
    backgroundColor: 'rgba(194, 122, 255, 0.10)',
  },
  tagText: {
    color: Colors.primary.vividPurple, // #C27AFF
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
  },
});
