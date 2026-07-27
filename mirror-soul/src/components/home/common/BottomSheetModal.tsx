import { Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
}

/**
 * 하단에서 슬라이드업되는 바텀시트 공통 래퍼 (SRP).
 * 백드롭 + 슬라이드업 애니메이션 + 상단 핸들바만 담당하며,
 * 내부 콘텐츠(children)는 사용처(LocationSelectModal, RefillModal 등)가 구성합니다.
 */
export default function BottomSheetModal({ visible, onClose, children, sheetStyle }: BottomSheetModalProps) {
  const { colors } = useThemeColors();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      progress.setValue(0);
    }
  }, [visible, progress]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.background.elevated, borderColor: colors.border.primary },
          sheetStyle,
          {
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border.strong }]} />
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 48,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: Radii.full,
    alignSelf: 'center',
    marginBottom: 32,
  },
});
