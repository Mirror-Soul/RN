import React from 'react';
import { Image, type ImageProps } from 'expo-image';

/** Prepared registration previews and public views always use the same centered cover crop. */
export function ProfilePhotoImage(props: Omit<ImageProps, 'contentFit' | 'contentPosition'>) {
  return <Image {...props} contentFit="cover" contentPosition="center" />;
}
