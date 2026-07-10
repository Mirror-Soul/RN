import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { FaqItem as FaqItemType } from '../constants/faqData';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

interface FaqItemProps {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export const FaqItem = ({ item, isOpen, onToggle, isLast = false }: FaqItemProps) => {
  const rotation = useSharedValue(0);
  const { colors, animatedText, animatedTextMuted, animatedBorder } = useAnimatedTheme();

  React.useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, { 
      duration: 250, 
      easing: Easing.out(Easing.cubic) 
    });
  }, [isOpen]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View 
      layout={LinearTransition.duration(250).easing(Easing.out(Easing.cubic))}
      style={[styles.wrapper, !isLast && styles.borderBottom, !isLast && animatedBorder]}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.questionRow, pressed && styles.questionRowPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.question}
      >
        <Animated.Text style={[styles.questionText, animatedText]}>{item.question}</Animated.Text>
        <Animated.View style={iconStyle}>
          <Feather name="chevron-down" size={16} color={colors.text.muted} />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.answerInner}>
            {/* answerText는 #99A1AF (neutral.lightGray) -> text.muted 로 대체 */}
            <Animated.Text style={[styles.answerText, animatedTextMuted]}>{item.answer}</Animated.Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'hidden', 
  },
  borderBottom: {
    borderBottomWidth: 0.61,
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
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // 매우 연한 프레스 상태 (공통)
  },
  questionText: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.15,
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
  },
});
