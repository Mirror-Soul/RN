import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { Colors, FontFamily } from '@/src/constants/theme';

/** Keep exactly the registration preview's gradient, caption area and name placement. */
export function DetailPhotoOverlay({ name, width, height, preview = false }: {
  name: string; width: number; height: number; preview?: boolean;
}) {
  const { fontScale } = useWindowDimensions();
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['transparent', 'rgba(5,5,5,0.4)', 'rgba(5,5,5,0.82)', Colors.primary.cardBlack]}
      locations={[0, 0.45, 0.85, 1]} style={StyleSheet.absoluteFill} />
    <View style={styles.copy}>
      <Text numberOfLines={2} lineBreakStrategyIOS="hangul-word" textBreakStrategy="highQuality"
        style={[styles.name, width < 200 && styles.compactName]}>{name || '내 프로필'}</Text>
      {preview && height >= 240 && fontScale <= 1.5 && <Text style={styles.caption}>사진 위에 프로필 정보가 표시돼요</Text>}
    </View>
  </View>;
}

/** Matches the existing recommendation-card registration preview. */
export function CardPhotoOverlay() {
  return <View pointerEvents="none" style={styles.arrow}><BrowseIcon name="arrows-out-simple" size={20} color="#fff" /></View>;
}
const styles = StyleSheet.create({
  copy: { position: 'absolute', bottom: 16, left: 16, right: 16, gap: 4 },
  name: { fontFamily: FontFamily.sans, fontSize: 22, lineHeight: 28, fontWeight: '700', color: '#fff' },
  compactName: { fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,0.85)' },
  arrow: { position: 'absolute', right: 12, bottom: 12, padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
});
