import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from './BottomSheet/BottomSheet';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConsentDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  /**
   * "확인했습니다" 버튼을 눌러 명시적으로 닫을 때만 호출됨 (배경 탭/스와이프로 닫을 때는 호출 안 함).
   * 내용을 실제로 확인했을 때만 체크박스를 자동으로 켜고 싶은 호출부에서 사용.
   */
  onConfirm?: () => void;
  title: string;
  content: string;
}

/**
 * 동의 항목(약관/개인정보/생체정보/마케팅/연령확인) 상세 내용을 보여주는 공용 바텀시트.

 *
 * 기존 BottomSheet(스프링 애니메이션 + 드래그로 닫기)를 재사용해서, 체크박스 옆
 * "보기"를 탭했을 때 실제 내용을 확인하지 않고 동의만 누르는 문제를 없앤다.
 */
export function ConsentDetailSheet({ visible, onClose, onConfirm, title, content }: ConsentDetailSheetProps) {
  const { colors } = useThemeColors();

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <BottomSheet isOpen={visible} onClose={onClose} height={SCREEN_HEIGHT * 0.75}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
        >
          <Text style={[styles.body, { color: colors.text.secondary }]}>{content}</Text>
        </ScrollView>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="확인했습니다"
        >
          <Text style={styles.closeButtonText}>확인했습니다</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  body: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    lineHeight: 22,
  },
  closeButton: {
    height: 52,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  closeButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary.soulBlack,
  },
});
