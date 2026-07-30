import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { Feather } from '@expo/vector-icons';

interface DeleteConfirmBottomSheetProps {
  isOpen: boolean;
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmBottomSheet = ({ isOpen, isConfirming = false, onClose, onConfirm }: DeleteConfirmBottomSheetProps) => {
  const { colors } = useThemeColors();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={260}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="trash-2" size={24} color={Colors.primary.recordingRed} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              최종 확인
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              정말로 계정을 비활성화 하시겠습니까?{'\n'}
              30일 경과 후 모든 데이터는 복구할 수 없습니다.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            disabled={isConfirming}
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary, opacity: isConfirming ? 0.5 : 1 }]}
          >
            <Text style={[styles.buttonText, { color: colors.text.secondary }]}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onConfirm}
            disabled={isConfirming}
            style={[styles.button, styles.deleteButton, { opacity: isConfirming ? 0.7 : 1 }]}
          >
            {isConfirming ? (
              <ActivityIndicator color={Colors.primary.activeRedText} />
            ) : (
              <Text style={[styles.buttonText, { color: Colors.primary.activeRedText }]}>탈퇴하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(251, 44, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xl,
    lineHeight: 27,
    letterSpacing: -0.44,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.61,
  },
  cancelButton: {
    // Dynamic styles applied inline via useThemeColors
  },
  deleteButton: {
    backgroundColor: 'rgba(251, 44, 54, 0.2)',
    borderColor: 'rgba(251, 44, 54, 0.3)',
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
});
