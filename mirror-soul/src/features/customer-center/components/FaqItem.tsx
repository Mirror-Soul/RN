import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { FaqItem as FaqItemType } from '../constants/faqData';

interface FaqItemProps {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

const ICON_SPRING = {
  damping: 15,
  stiffness: 180,
};

/**
 * FAQ 아코디언 개별 항목
 *
 * ✅ 핵심 전략: 가변 높이 문제 해결
 *   1. 답변 텍스트를 opacity:0, position:absolute 로 먼저 렌더링
 *   2. onLayout 콜백으로 실제 높이 측정 → contentHeight SharedValue 저장
 *   3. 토글 시 animatedHeight를 0 ↔ contentHeight 로 withSpring 보간
 *
 * ✅ 아이콘 회전: CSS 명세의 transform:rotate(180deg)를
 *   rotation SharedValue + withSpring으로 재현
 */
export const FaqItem = ({ item, isOpen, onToggle, isLast = false }: FaqItemProps) => {
  // 답변 영역의 실제 렌더링 높이 (onLayout으로 측정)
  const contentHeight = useSharedValue(0);
  // 현재 보여지는 높이 (0 ~ contentHeight)
  const animatedHeight = useSharedValue(0);
  // 화살표 아이콘 회전 각도 (0 ~ 180)
  const rotation = useSharedValue(0);
  // 최초 측정 완료 여부 (중복 측정 방지)
  const measured = useRef(false);

  const handleContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && !measured.current) {
      measured.current = true;
      contentHeight.value = h;
      // 이미 열려있는 상태라면 즉시 높이 반영
      if (isOpen) {
        animatedHeight.value = h;
      }
    }
  };

  // 부모에서 isOpen이 변경될 때 애니메이션 트리거
  React.useEffect(() => {
    animatedHeight.value = withSpring(
      isOpen ? contentHeight.value : 0,
      SPRING_CONFIG
    );
    rotation.value = withSpring(isOpen ? 180 : 0, ICON_SPRING);
  }, [isOpen]);

  // 답변 영역 높이 애니메이션 스타일
  const answerContainerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    overflow: 'hidden',
  }));

  // 화살표 회전 스타일
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.wrapper, !isLast && styles.borderBottom]}>
      {/* 질문 행 (탭 가능) */}
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.questionRow, pressed && styles.questionRowPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.question}
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <Animated.View style={iconStyle}>
          <Feather name="chevron-down" size={16} color="#6A7282" />
        </Animated.View>
      </Pressable>

      {/* 답변 영역 - 높이 애니메이션으로 펼침/접힘 */}
      <Animated.View style={answerContainerStyle}>
        {/* 실제 답변 텍스트 (높이 측정용 invisible 레이어 겸용) */}
        <View onLayout={handleContentLayout}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      </Animated.View>

      {/* 높이 측정용 절대 위치 레이어 (초기 렌더링 시 한 번만 사용) */}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  borderBottom: {
    borderBottomWidth: 0.61,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 52,
  },
  questionRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  questionText: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.15,
    color: '#FFFFFF',
  },
  answerText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: -0.15,
    color: '#99A1AF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
