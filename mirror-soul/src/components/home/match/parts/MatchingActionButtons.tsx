import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
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
export type MatchingTab = 'meet' | 'chat';
export default function MatchingActionButtons({
  activeTab,
  onChangeTab,
  unreadCount = 0,
  requestCount,
}: {
  activeTab: MatchingTab;
  onChangeTab: (tab: MatchingTab) => void;
  unreadCount?: number;
  requestCount?: number;
}) {
  const { colors, palette } = useMatchingDesign();
  return (
    <View
      style={[
        styles.tabs,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.primary,
        },
      ]}
    >
      {(
        [
          { id: 'meet', label: '받은 신청', count: requestCount ?? 0 },
          { id: 'chat', label: '메시지', count: unreadCount },
        ] as const
      ).map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onChangeTab(tab.id)}
          accessibilityRole="tab"
          accessibilityLabel={
            tab.id === 'meet'
              ? `받은 신청${requestCount == null ? '' : ` ${requestCount}건`}`
              : `메시지${unreadCount > 0 ? `, 읽지 않은 메시지 ${unreadCount}개` : ''}`
          }
          accessibilityState={{ selected: activeTab === tab.id }}
          style={[
            styles.tab,
            {
              backgroundColor:
                activeTab === tab.id ? palette.tint : 'transparent',
              borderColor: 'transparent',
            },
          ]}
        >
          <Feather
            name={tab.id === 'meet' ? 'heart' : 'message-circle'}
            size={17}
            color={
              activeTab === tab.id ? colors.brand.accent : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.label,
              {
                color:
                  activeTab === tab.id
                    ? colors.brand.accent
                    : colors.text.secondary,
              },
            ]}
          >
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <Text
              style={[
                styles.badge,
                {
                  color: palette.onAccent,
                  backgroundColor: colors.brand.accent,
                },
              ]}
            >
              {tab.count > 99 ? '99+' : tab.count}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radii.xl,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    padding: Spacing.sm,
    borderRadius: Radii.lg2,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 23,
  },
  badge: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    lineHeight: 20,
    fontWeight: FontWeight.semibold,
    paddingHorizontal: Spacing.xs,
    minWidth: 22,
    textAlign: 'center',
    borderRadius: Radii.full,
  },
});
