import { useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBarInsetContext } from '@/src/components/common/FloatingTabBarInsetContext';
import { mainTabContentPadding, tabBarGeometry } from '@/src/components/home/main/tabBarGeometry';
import { useLayout } from './useLayout';

/** Same measured obstruction + breathing room for all five main lists. */
export function useMainTabBottomPadding() {
  const obstruction = useContext(FloatingTabBarInsetContext);
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const { sizeClass } = useLayout();
  const geometry = tabBarGeometry(width, insets.left, insets.right, fontScale, sizeClass);
  return mainTabContentPadding(obstruction, geometry.estimatedHeight + geometry.bottomGap + insets.bottom);
}
