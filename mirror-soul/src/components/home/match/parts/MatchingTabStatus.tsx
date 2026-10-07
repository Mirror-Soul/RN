import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
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
  kind = 'requests',
}: {
  message: string;
  description?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  onExplore?: () => void;
  onRequests?: () => void;
  kind?: 'requests' | 'messages';
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
          <ActivityIndicator color={palette.accentInk} />
        ) : (
          <BrowseIcon
            name={onRetry ? 'wifi-slash' : kind === 'messages' ? 'chat-circle-dots' : 'user-plus'}
            size={24}
            color={palette.accentInk}
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
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  symbol: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
