import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface UseSwitchToggleProps {
  selectedIndex: number;
  totalSegments: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export function useSwitchToggle({ 
  selectedIndex, 
  totalSegments, 
  stiffness = 350, 
  damping = 28, 
  mass = 0.8 
}: UseSwitchToggleProps) {
  
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      left: withSpring(`${(selectedIndex * (100 / totalSegments))}%`, {
        stiffness,
        damping,
        mass,
      }),
    };
  });

  return { indicatorStyle };
}
