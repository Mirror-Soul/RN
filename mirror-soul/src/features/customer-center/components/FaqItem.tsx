import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { FaqItem as FaqItemType } from '../constants/faqData';

interface FaqItemProps {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

// 오버스슛(통통 튀는 현상)을 억제하여 차분한 애니메이션 적용
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 150,
  mass: 0.8,
  overshootClamping: true, 
};

/**
 * FAQ 아코디언 개별 항목
 *
 * [실무적 버그 해결 방안]
 * 1. 높이 측정 (내용이 안 나오는 버그): 
 *    부모가 height: 0, overflow: hidden 이면 자식의 onLayout 측정값이 0이 나올 수 있습니다.
 *    따라서 opacity: 0, position: absolute 인 별도의 측정 전용 컨테이너를 먼저 렌더링하여
 *    정확한 높이를 구한 뒤 상태로 저장합니다.
 * 2. 아이콘 요동 현상: 
 *    단순 회전에 withSpring을 쓰면 탄성 때문에 요동치듯(wobble) 보입니다.
 *    withTiming과 Easing 함수를 사용하여 직관적이고 차분하게 회전하도록 수정했습니다.
 */
export const FaqItem = ({ item, isOpen, onToggle, isLast = false }: FaqItemProps) => {
  // 실제 렌더링 높이를 상태로 저장하여 컴포넌트를 업데이트
  const [contentHeight, setContentHeight] = useState(0);
  
  // 현재 보여지는 높이 (0 ~ contentHeight)
  const animatedHeight = useSharedValue(0);
  // 화살표 아이콘 회전 각도 (0 ~ 180)
  const rotation = useSharedValue(0);

  const handleContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && contentHeight === 0) {
      setContentHeight(h);
    }
  };

  // 부모에서 isOpen이 변경되거나 측정 높이가 세팅될 때 애니메이션 트리거
  React.useEffect(() => {
    // 높이가 측정된 이후에만 스프링 애니메이션 적용
    if (contentHeight > 0) {
      animatedHeight.value = withSpring(
        isOpen ? contentHeight : 0,
        SPRING_CONFIG
      );
    }
    
    // 아이콘은 요동치지 않도록 Timing 애니메이션 적용 (실무 트렌드)
    rotation.value = withTiming(isOpen ? 180 : 0, { 
      duration: 250, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [isOpen, contentHeight]);

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

      {/* 답변 영역 - 측정된 높이 기반으로 스프링 애니메이션 */}
      <Animated.View style={answerContainerStyle}>
        <View style={styles.answerInner}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      </Animated.View>

      {/* 높이 측정용 절대 위치 레이어 (처음 한 번만 렌더링하여 높이 측정 후 DOM에서 제거됨) */}
      {contentHeight === 0 && (
        <View style={styles.measureContainer} pointerEvents="none">
          <View onLayout={handleContentLayout} style={styles.answerInner}>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative', // 측정용 컨테이너의 absolute 기준점
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
  answerInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    width: '100%',
  },
  answerText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: -0.15,
    color: '#99A1AF',
  },
  measureContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    opacity: 0, // 사용자에게는 보이지 않음
  },
});
