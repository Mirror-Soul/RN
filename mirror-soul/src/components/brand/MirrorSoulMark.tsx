import React from 'react';
import Svg, { Path } from 'react-native-svg';
import mark from '@/assets/brand/mirrorsoul-mark.json';

/** Shared geometry with the launcher icons; vector edges stay crisp at every size. */
export default function MirrorSoulMark({ size = 48 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox={mark.viewBox} accessible={false}>
    {mark.layers.map((layer, index) => <Path key={index} d={layer.path} fill={layer.fill} />)}
  </Svg>;
}
