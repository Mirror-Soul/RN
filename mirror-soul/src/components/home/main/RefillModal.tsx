import BottomSheetModal from '@/src/components/home/common/BottomSheetModal';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TIME_REFILL_OPTIONS } from '@/src/features/profile/constants/timeRefillOptions';

interface TimePackage {
  id: string;
  duration: string;
  tagline: string;
  price: string;
  best: boolean;
  note: string;
}

// TIME_REFILL_OPTIONS(단일 소스)에서 파생 — 여기서 별도로 가격/구성을 하드코딩하면
// TimeRefillBottomSheet.tsx와 가격이 어긋날 수 있다.
const TIME_PACKAGES: TimePackage[] = TIME_REFILL_OPTIONS.map((option) => ({
  id: option.id,
  duration: option.addedTime.replace('+ ', ''),
  tagline: option.durationLabel,
  price: option.price,
  best: option.badge?.type === 'popular',
  note: option.badge?.text ?? '',
}));

interface RefillModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPackage?: (pkgId: string) => void;
}

/**
 * RefillModal 컴포넌트 (SRP)
 * 시간 충전 패키지 목록 UI만 담당합니다.
 */
export default function RefillModal({ visible, onClose, onSelectPackage }: RefillModalProps) {
  const { colors } = useThemeColors();

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>시간 채우기</Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>더 깊은 공명을 위해 대화 시간을 충전하세요.</Text>
      </View>

      <View style={styles.packageList}>
        {TIME_PACKAGES.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
              pkg.best && styles.packageCardBest,
            ]}
            onPress={() => onSelectPackage?.(pkg.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${pkg.duration} 충전`}
          >
            {pkg.note ? (
              <View style={styles.noteBadge}>
                <Text style={styles.noteBadgeText}>{pkg.note}</Text>
              </View>
            ) : null}
            <Text style={[styles.durationText, { color: colors.text.primary }]}>+{pkg.duration}</Text>
            <Text style={[styles.taglineText, { color: colors.text.muted }]}>{pkg.tagline}</Text>
            <Text style={styles.priceText}>{pkg.price}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.laterButton}>
        <Text style={[styles.laterText, { color: colors.text.muted }]}>나중에 하기</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 30,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
  packageList: {
    gap: Spacing.md,
  },
  packageCard: {
    padding: Spacing.xxl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  packageCardBest: {
    backgroundColor: Colors.glass.cyan10_d3,
    borderColor: Colors.glass.cyan30_d3,
  },
  noteBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
  },
  noteBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black,
    textTransform: 'uppercase',
    color: Colors.primary.soulBlack,
  },
  durationText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  taglineText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  priceText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.primary.electricCyan,
    marginTop: Spacing.lg,
  },
  laterButton: {
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  laterText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
