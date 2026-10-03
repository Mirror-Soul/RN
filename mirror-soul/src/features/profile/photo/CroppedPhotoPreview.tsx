import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { getCoverScale, type CropRect, type PhotoSize } from './photoGeometry';

/** 최종 4:5 크롭을 가운데 cover로 표시한다. 제스처마다 파일을 생성하지 않는다. */
export function CroppedPhotoPreview({ photo, crop, width, height, round = false, label }: {
  photo: PhotoSize & { uri: string }; crop: CropRect; width: number; height: number; round?: boolean; label: string;
}) {
  const scale = getCoverScale(crop, { width, height });
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.frame, { width, height, borderRadius: round ? width / 2 : 12 }]}>
      <Image source={{ uri: photo.uri }} contentFit="fill" accessible={false} style={{
        position: 'absolute', width: photo.width * scale, height: photo.height * scale,
        left: (width - crop.width * scale) / 2 - crop.originX * scale,
        top: (height - crop.height * scale) / 2 - crop.originY * scale,
      }} />
    </View>
  );
}
const styles = StyleSheet.create({ frame: { overflow: 'hidden', backgroundColor: '#111' } });
