import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  LinearTransition,
  FadeIn,
  FadeOutUp,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { FaqItem as FaqItemType } from '../constants/faqData';

interface FaqItemProps {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

/**
 * FAQ 아코디언 개별 항목 (Reanimated 3 최적화 버전)
 *
 * [실무적 버그 해결 방안]
 * - 버벅임(Layout Thrashing) 문제 해결: 
 *   이전 코드의 onLayout과 height 보간을 완전히 제거했습니다.
 *   대신 Reanimated 3의 LinearTransition을 부모에 적용하고, 
 *   내용을 조건부 렌더링(isOpen)하여 UI 스레드에서 자동으로 스무스하게 
 *   높이와 레이아웃을 Morphing 하도록 최적화했습니다.
 */
export const FaqItem = ({ item, isOpen, onToggle, isLast = false }: FaqItemProps) => {
  // 화살표 아이콘 회전 각도 (0 ~ 180)
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    // 아이콘은 요동치지 않도록 Timing 애니메이션 적용
    rotation.value = withTiming(isOpen ? 180 : 0, { 
      duration: 250, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [isOpen]);

  // 화살표 회전 스타일
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View 
      layout={LinearTransition.duration(250).easing(Easing.out(Easing.cubic))}
      style={[styles.wrapper, !isLast && styles.borderBottom]}
    >
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

      {/* 
        답변 영역 - 열렸을 때만 렌더링. 
        흐느적거림(Jelly Effect) 제거를 위해 FadeOutUp 대신 깔끔한 FadeOut 적용.
        부모의 LinearTransition(Timing 기반)이 견고하게 전체 높이를 조절합니다.
      */}
      {isOpen && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.answerInner}>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'hidden', // FadeOutUp 시 영역 밖으로 튀어나가지 않도록 설정
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
});
