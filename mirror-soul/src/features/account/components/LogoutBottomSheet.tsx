import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { Feather } from '@expo/vector-icons';

interface LogoutBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const LogoutBottomSheet = ({ isOpen, onClose, onLogout }: LogoutBottomSheetProps) => {
  const { colors } = useThemeColors();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={214}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="alert-triangle" size={24} color={Colors.primary.recordingRed} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              로그아웃 하시겠습니까?
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              남은 시간과 대화 기록은 안전하게 보관됩니다.{'\n'}
              언제든 다시 돌아오세요.
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
            onPress={onLogout}
            style={[styles.button, styles.logoutButton]}
          >
            <Text style={[styles.buttonText, { color: Colors.primary.activeRedText }]}>로그아웃</Text>
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
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(251, 44, 54, 0.1)', // Danger Red tint
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
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    lineHeight: 27,
    letterSpacing: -0.44,
    marginBottom: Spacing.xxs,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 45.2,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.61,
  },
  cancelButton: {
    // Dynamic styles applied inline via useThemeColors
  },
  logoutButton: {
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
