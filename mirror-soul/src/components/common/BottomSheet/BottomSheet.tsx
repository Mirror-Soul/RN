import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, Modal } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

export const BottomSheet = ({ isOpen, onClose, children, height = SCREEN_HEIGHT * 0.8 }: BottomSheetProps) => {
  const { colors } = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(isOpen);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  
  const springConfig = {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
  };

  const closeSheet = () => {
    'worklet';
    translateY.value = withSpring(SCREEN_HEIGHT, springConfig);
    opacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  useEffect(() => {
    if (isOpen) {
      setIsModalVisible(true);
      translateY.value = withSpring(0, springConfig);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, springConfig);
      opacity.value = withTiming(0, { duration: 250 }, () => {
        runOnJS(setIsModalVisible)(false);
      });
    }
  }, [isOpen]);

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

  return (
    <Modal visible={isModalVisible} transparent animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <TouchableWithoutFeedback onPress={() => closeSheet()}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, animatedSheetStyle, { height, backgroundColor: colors.background.card, borderTopColor: colors.border.primary }]}>
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border.strong }]} />
            </View>
            
            <View style={styles.contentContainer}>
              {children}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.61,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 2,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
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
