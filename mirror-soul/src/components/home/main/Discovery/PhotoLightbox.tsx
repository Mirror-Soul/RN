import { Feather } from '@expo/vector-icons';
import { Colors, Spacing } from '@/src/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoLightboxProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

/**
 * PhotoLightbox 컴포넌트 (SRP)
 * 발견 탭 추천 카드 사진을 탭했을 때 전체화면으로 크게 보여주는 뷰어.
 * profileImageUrl이 아직 단일 필드라 사진 한 장만 다룬다(여러 장 넘기기 없음).
 * 배경 아무 곳이나 탭하거나 우상단 닫기 버튼으로 닫힌다.
 */
export default function PhotoLightbox({ visible, imageUrl, onClose }: PhotoLightboxProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="contain" cachePolicy="disk" />

        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.md }]}
          onPress={onClose}
          hitSlop={Spacing.sm}
          accessibilityRole="button"
          accessibilityLabel="사진 보기 닫기"
        >
          <Feather name="x" size={22} color={Colors.neutral.pureWhite} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass.black40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
