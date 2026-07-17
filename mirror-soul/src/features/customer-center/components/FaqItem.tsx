import React from 'react';
import { FontFamily } from '@/src/constants/theme';

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
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface FaqItemProps {
  item: FaqItemType;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export const FaqItem = ({ item, isOpen, onToggle, isLast = false }: FaqItemProps) => {
  const rotation = useSharedValue(0);
  const { colors } = useThemeColors();

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
      style={[styles.wrapper, !isLast && styles.borderBottom, !isLast && { borderColor: colors.border.primary }]}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.questionRow, pressed && { backgroundColor: colors.background.glass }]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={item.question}
      >
        <Text style={[styles.questionText, { color: colors.text.primary }]}>{item.question}</Text>
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
            <Text style={[styles.answerText, { color: colors.text.muted }]}>{item.answer}</Text>
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
  },
  questionText: {
    flex: 1,
    fontFamily: FontFamily.sans,
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
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: -0.15,
  },
});
