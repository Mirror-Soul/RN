import { Feather } from '@expo/vector-icons';
import { Colors, Spacing } from '@/src/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRetryableProfileImage } from '@/src/features/profile/photo/useRetryableProfileImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoLightboxProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
  onReload?: () => Promise<unknown>;
}

/**
 * PhotoLightbox 컴포넌트 (SRP)
 * 발견 탭 추천 카드 사진을 탭했을 때 전체화면으로 크게 보여주는 뷰어.
 * profileImageUrl이 아직 단일 필드라 사진 한 장만 다룬다(여러 장 넘기기 없음).
 * 배경 아무 곳이나 탭하거나 우상단 닫기 버튼으로 닫힌다.
 */
export default function PhotoLightbox({ visible, imageUrl, onClose, onReload }: PhotoLightboxProps) {
  const insets = useSafeAreaInsets();
  const photo = useRetryableProfileImage(imageUrl, onReload);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {imageUrl && !photo.failed ? <Image key={photo.imageKey} source={{ uri: imageUrl }} style={styles.image} contentFit="contain" cachePolicy="disk" onError={photo.onError} />
          : <ScrollView style={styles.errorScroll} contentContainerStyle={styles.error}>
            <Text style={styles.copy}>{imageUrl ? '사진을 불러오지 못했어요.' : '등록된 사진이 없어요.'}</Text>
            {imageUrl && <Pressable accessibilityRole="button" accessibilityLabel="추천 사진 크게 보기 다시 불러오기" disabled={photo.isReloading}
              onPress={() => { void photo.retry(); }} style={styles.retry}>
              {photo.isReloading ? <ActivityIndicator color="white" /> : <Text style={styles.copy}>다시 불러오기</Text>}
            </Pressable>}
          </ScrollView>}

        <Pressable
          style={[styles.closeButton, { top: insets.top + Spacing.md, right: insets.right + Spacing.lg }]}
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
  error: { paddingHorizontal: 24, alignItems: 'center', gap: 12 },
  errorScroll: { width: '100%', maxHeight: '70%', flexGrow: 0 },
  copy: { color: Colors.neutral.pureWhite, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  retry: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.glass.white30 },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass.black40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
