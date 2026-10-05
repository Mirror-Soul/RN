import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Modal, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Spacing } from '@/src/constants/theme';


const springConfig = { damping: 20, stiffness: 200, mass: 0.8 };

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
  dragFromHandleOnly?: boolean;
  /** Render inside an existing full-screen Modal; never present a second native Modal. */
  embedded?: boolean;
}

export const BottomSheet = ({ isOpen, onClose, children, height: requestedHeight, dragFromHandleOnly = false, embedded = false }: BottomSheetProps) => {
  const { colors } = useThemeColors();
  const { height: screenHeight } = useWindowDimensions();
  const height = Math.min(requestedHeight ?? screenHeight * 0.8, screenHeight);
  const [isModalVisible, setIsModalVisible] = useState(isOpen);
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);
  
  const closeSheet = () => {
    'worklet';
    translateY.value = withSpring(screenHeight, springConfig);
    opacity.value = withTiming(0, { duration: 250 }, finished => {
      if (finished) runOnJS(onClose)();
    });
  };

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      translateY.value = withSpring(0, springConfig);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(screenHeight, springConfig);
      opacity.value = withTiming(0, { duration: 250 }, finished => {
        if (finished) runOnJS(setIsModalVisible)(false);
      });
    }
  }, [isOpen, screenHeight, opacity, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > height * 0.2 || event.velocityY > 500) {
        closeSheet();
      } else {
        translateY.value = withSpring(0, springConfig);
      }
    });

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handle = <View style={styles.handleContainer}>
    <View style={[styles.handle, { backgroundColor: colors.border.strong }]} />
  </View>;
  const sheet = <Animated.View style={[styles.sheet, animatedSheetStyle, { height, backgroundColor: colors.background.card, borderTopColor: colors.border.primary }]}>
    {dragFromHandleOnly ? <GestureDetector gesture={panGesture}>{handle}</GestureDetector> : handle}
    <View style={styles.contentContainer}>{children}</View>
  </Animated.View>;

  const content = (
      <GestureHandlerRootView accessibilityViewIsModal style={[StyleSheet.absoluteFill, styles.overlay]}>
        <TouchableWithoutFeedback onPress={() => closeSheet()}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        {dragFromHandleOnly ? sheet : <GestureDetector gesture={panGesture}>{sheet}</GestureDetector>}
      </GestureHandlerRootView>
  );
  if (embedded) return isModalVisible ? content : null;
  return (
    <Modal visible={isModalVisible} transparent animationType="none" onRequestClose={closeSheet}>
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { zIndex: 10 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: Spacing.none,
    left: Spacing.none,
    right: Spacing.none,
    borderTopWidth: 0.61,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 2,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
});
