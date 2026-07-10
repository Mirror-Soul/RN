import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FaqItem } from './FaqItem';
import { useFaqAccordion } from '../hooks/useFaqAccordion';
import { FAQ_ITEMS } from '../constants/faqData';

/**
 * FAQ 아코디언 목록 컨테이너
 *
 * useFaqAccordion 훅을 통해 Single-Open 방식으로 상태를 관리합니다.
 * FaqItem 각각은 isOpen 여부만 받아 독립적으로 애니메이션 처리합니다.
 */
export const FaqAccordion = () => {
  const { toggle, isOpen } = useFaqAccordion();

  return (
    <View style={styles.card}>
      {FAQ_ITEMS.map((item, index) => (
        <FaqItem
          key={item.id}
          item={item}
          isOpen={isOpen(item.id)}
          onToggle={() => toggle(item.id)}
          isLast={index === FAQ_ITEMS.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
});
