import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

/**
 * VerificationModal 컴포넌트 (SRP)
 * 프로필(직업/신원) 인증 신청 바텀시트입니다.
 * 실제 이미지 피커/업로드/인증 심사 연동은 범위 밖 — mock 타이머로 완료 처리.
 * 다만 최소한 "이미지를 선택하는 동작을 거쳐야 인증 신청이 가능하다"는 흐름의 모양은
 * 지킨다 — hasSelectedImage 없이 인증 신청이 바로 성공 처리되는 걸 막기 위한 로컬 상태.
 */
export default function VerificationModal({ isOpen, onClose, onVerified }: VerificationModalProps) {
  const { colors } = useThemeColors();
  const [isUploading, setIsUploading] = useState(false);
  const [hasSelectedImage, setHasSelectedImage] = useState(false);

  const handleSelectImage = () => {
    // TODO: 실제 이미지 피커(expo-image-picker 등) 연동 시 교체 — 지금은 선택 여부만 로컬로 관리
    setHasSelectedImage(true);
  };

  const handleVerify = () => {
    if (!hasSelectedImage) return;
    setIsUploading(true);
    // TODO: 실제 이미지 업로드 + 인증 심사 API 연동 시 교체
    setTimeout(() => {
      setIsUploading(false);
      onVerified();
      onClose();
    }, 2000);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={560}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Ionicons name="shield-checkmark-outline" size={40} color={Colors.primary.electricCyan} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>프로필 인증</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>
            본인의 직업이나 신원을 증명할 수 있는{'\n'}이미지(명함, 사원증 등)를 제출해 주세요.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadBox,
            { borderColor: hasSelectedImage ? Colors.primary.electricCyan : colors.border.primary },
          ]}
          onPress={handleSelectImage}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={hasSelectedImage ? '증명 이미지 선택됨' : '증명 이미지 선택'}
          accessibilityState={{ selected: hasSelectedImage }}
        >
          <Feather
            name={hasSelectedImage ? 'check-circle' : 'upload'}
            size={28}
            color={hasSelectedImage ? Colors.primary.electricCyan : colors.text.muted}
          />
          <Text style={[styles.uploadText, { color: hasSelectedImage ? Colors.primary.electricCyan : colors.text.muted }]}>
            {hasSelectedImage ? '이미지가 선택됐어요' : '이미지 선택하기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: colors.text.primary },
            !hasSelectedImage && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={isUploading || !hasSelectedImage}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="인증 신청하기"
          accessibilityState={{ disabled: isUploading || !hasSelectedImage }}
        >
          {isUploading ? (
            <ActivityIndicator color={colors.background.primary} />
          ) : (
            <Text style={[styles.verifyButtonText, { color: colors.background.primary }]}>인증 신청하기</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} disabled={isUploading} activeOpacity={0.7} style={styles.laterButton}>
          <Text style={[styles.laterText, { color: colors.text.muted }]}>나중에 하기</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: Radii.xxl,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    textAlign: 'center',
  },
  uploadBox: {
    aspectRatio: 16 / 9,
    borderRadius: Radii.xxl,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  uploadText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
  },
  verifyButton: {
    height: 64,
    borderRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  laterText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
