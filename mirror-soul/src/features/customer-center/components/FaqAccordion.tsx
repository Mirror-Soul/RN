import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { FaqItem } from './FaqItem';
import { useFaqAccordion } from '../hooks/useFaqAccordion';
import { FAQ_ITEMS } from '../constants/faqData';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export const FaqAccordion = () => {
  const { toggle, isOpen } = useFaqAccordion();
  const { colors } = useThemeColors();

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
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
