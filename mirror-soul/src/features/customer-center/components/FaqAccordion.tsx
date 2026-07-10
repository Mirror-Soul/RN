import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { FaqItem } from './FaqItem';
import { useFaqAccordion } from '../hooks/useFaqAccordion';
import { FAQ_ITEMS } from '../constants/faqData';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const FaqAccordion = () => {
  const { toggle, isOpen } = useFaqAccordion();
  const { animatedGlassBackground } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.card, animatedGlassBackground]}>
      {FAQ_ITEMS.map((item, index) => (
        <FaqItem
          key={item.id}
          item={item}
          isOpen={isOpen(item.id)}
          onToggle={() => toggle(item.id)}
          isLast={index === FAQ_ITEMS.length - 1}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
});
