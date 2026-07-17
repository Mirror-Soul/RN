import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface MicPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onClose: () => void;
}

/**
 * 마이크 접근 권한이 거부되었을 때 표시되는 모달.
 * 사용자에게 권한의 필요성을 설명하고 설정 화면으로 이동할 수 있도록 안내합니다.
 */
export default function MicPermissionModal({
  visible,
  onRequestPermission,
  onClose,
}: MicPermissionModalProps) {
  const { colors } = useThemeColors();
  const handleOpenSettings = () => {
    Linking.openSettings();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: colors.background.overlay || 'rgba(0, 0, 0, 0.70)' }]}>
        <View style={[styles.container, { backgroundColor: colors.background.card || 'rgba(20, 20, 30, 0.95)' }]}>
          {/* 아이콘 영역 */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🎤</Text>
          </View>

          {/* 텍스트 영역 */}
          <Text style={[styles.title, { color: colors.text.primary }]}>마이크 접근 권한 필요</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            AI 인터뷰 녹음을 위해 마이크 접근 권한이 필요합니다.{'\n'}
            음성 데이터는 안전하게 보호됩니다.
          </Text>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={onRequestPermission}
            >
              <Text style={styles.primaryButtonText}>권한 허용하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={handleOpenSettings}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>설정에서 변경</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text.muted }]}>나중에 하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radii.xxl,
    backgroundColor: Colors.glass.cyan10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.15,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: Radii.md2,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.primary.soulBlack,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 48,
    borderRadius: Radii.md2,
    borderWidth: 1,
    borderColor: Colors.glass.white20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
