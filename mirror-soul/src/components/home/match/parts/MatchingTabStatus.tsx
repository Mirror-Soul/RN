import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import {
  useMatchingDesign,
  MatchingText as Text,
} from '@/src/features/match/components/MatchingDesign';
import { MatchActionButton } from '@/src/features/match/components/MatchActionButton';
export default function MatchingTabStatus({
  message,
  description,
  isLoading,
  onRetry,
  onExplore,
  onRequests,
}: {
  message: string;
  description?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  onExplore?: () => void;
  onRequests?: () => void;
}) {
  const { colors, palette } = useMatchingDesign();
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.border.primary,
          backgroundColor: colors.background.card,
        },
      ]}
    >
      <View style={[styles.symbol, { backgroundColor: palette.tint }]}>
        {isLoading ? (
          <ActivityIndicator color={colors.brand.accent} />
        ) : (
          <Feather
            name={onRetry ? 'wifi-off' : 'heart'}
            size={28}
            color={colors.brand.accent}
          />
        )}
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>
        {message}
      </Text>
      {description && (
        <Text style={[styles.copy, { color: colors.text.secondary }]}>
          {description}
        </Text>
      )}
      {onRetry && !isLoading && (
        <MatchActionButton label="다시 불러오기" onPress={onRetry} />
      )}
      {onExplore && (
        <MatchActionButton label="상대 둘러보기" onPress={onExplore} primary />
      )}
      {onRequests && (
        <MatchActionButton label="받은 신청 확인하기" onPress={onRequests} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.xl,
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  symbol: {
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: 26,
    textAlign: 'center',
  },
  copy: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 23,
    textAlign: 'center',
  },
});
