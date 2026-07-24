import { Colors, Radii } from '@/src/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';

export interface DropdownAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectDropdownModalProps {
  onClose: () => void;
  children: React.ReactNode;
  panelStyle?: StyleProp<ViewStyle>;
  /** 트리거(토글) 버튼의 화면상 위치. 지정 시 그 바로 아래에 드롭다운을 붙입니다. */
  anchor: DropdownAnchor;
}

const GAP = 8;
const SCREEN_MARGIN = 16;
const MIN_PANEL_HEIGHT = 120;

/**
 * 선택형 드롭다운(지역/직군 등)을 위한 공통 모달 오버레이.
 * position:absolute 트릭 대신 네이티브 Modal을 사용해
 * Android에서 뒤 화면 터치가 가로채이거나 배경이 비치는 문제를 방지하면서도,
 * 토글 버튼 바로 아래에 앵커링되는 자연스러운 드롭다운 형태로 렌더링합니다.
 */
export default function SelectDropdownModal({ onClose, children, panelStyle, anchor }: SelectDropdownModalProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const { height: screenHeight } = Dimensions.get('window');
  const rawTop = anchor.y + anchor.height + GAP;
  // 트리거가 화면 하단에 가까워 아래 공간이 부족하면, 패널이 화면 밖으로 넘치지 않도록
  // top을 위로 clamp하여 최소 높이(MIN_PANEL_HEIGHT)가 항상 화면 안에 들어오게 합니다.
  const top = Math.min(rawTop, Math.max(SCREEN_MARGIN, screenHeight - MIN_PANEL_HEIGHT - SCREEN_MARGIN));
  const maxHeight = screenHeight - top - SCREEN_MARGIN;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.panel,
          { top, left: anchor.x, width: anchor.width, maxHeight },
          panelStyle,
          {
            opacity: progress,
            transform: [
              { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-GAP, 0] }) },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 8, 16, 0.35)',
  },
  panel: {
    position: 'absolute',
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.slate95,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});
