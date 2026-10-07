import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { browseIconPaths } from './browseIconPaths';

/** Small local Phosphor duotone set; no remote icon/font loading or new native module. */
export function BrowseIcon({ name, size = 20, color }: {
  name: keyof typeof browseIconPaths;
  size?: number;
  color: string;
}) {
  return <Svg width={size} height={size} viewBox="0 0 256 256" fill={color}
    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {browseIconPaths[name].map((path, index) => <Path key={index} d={path.d} opacity={'opacity' in path ? path.opacity : 1} />)}
  </Svg>;
}
