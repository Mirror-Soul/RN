import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors } from '@/src/constants/theme';
import { Feather } from '@expo/vector-icons';

interface DeleteConfirmBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmBottomSheet = ({ isOpen, onClose, onConfirm }: DeleteConfirmBottomSheetProps) => {
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
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
          >
            <Text style={[styles.buttonText, { color: colors.text.secondary }]}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onConfirm}
            style={[styles.button, styles.deleteButton]}
          >
            <Text style={[styles.buttonText, { color: Colors.primary.activeRedText }]}>탈퇴하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 44, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: -0.44,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 16,
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
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: -0.15,
  },
});
