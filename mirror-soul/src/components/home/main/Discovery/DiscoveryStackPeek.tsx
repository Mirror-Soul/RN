import { Colors, Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { Recommendation } from '@/src/types/api/home';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface DiscoveryStackPeekProps {
  match: Recommendation;
}

/**
 * DiscoveryStackPeek 컴포넌트 (SRP)
 * 현재 카드 바로 뒤에 다음 후보 카드가 살짝 보이는 순수 장식용 레이어.
 * 인터랙션이 전혀 없다(pointerEvents="none") — 스와이프 대상은 항상 맨 위 카드뿐이고,
 * 이 카드는 "이 스택이 계속 넘길 수 있다"는 걸 보여주는 용도(항상 노출)다.
 */
export default function DiscoveryStackPeek({ match }: DiscoveryStackPeekProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View
      pointerEvents="none"
      style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
    >
      {imageFailed ? (
        <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={StyleSheet.absoluteFillObject} />
      ) : (
        <Image
          source={{ uri: match.profileImageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => setImageFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    transform: [{ scale: 0.94 }, { translateY: 14 }],
  },
});
