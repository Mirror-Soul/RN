import React from 'react';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
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
  const { fontScale } = useWindowDimensions();
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
                activeTab === tab.id ? palette.buttonBase : 'transparent',
              borderColor: activeTab === tab.id ? palette.buttonBorder : 'transparent',
            },
          ]}
        >
          <View style={[styles.tabContent, fontScale > 1.5 && styles.tabContentStacked]}>
          {fontScale <= 1.3 && <BrowseIcon
            name={tab.id === 'meet' ? 'user-plus' : 'chat-circle-dots'}
            size={20}
            color={
              activeTab === tab.id ? palette.onAccent : colors.text.secondary
            }
          />}
          <Text
            style={[
              styles.label,
              {
                color:
                  activeTab === tab.id
                    ? palette.onAccent
                    : colors.text.secondary,
              },
            ]}
          >
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <View style={[styles.badge, { backgroundColor: activeTab === tab.id ? palette.buttonBorder : palette.coolTint }]}>
            <Text
              style={[
                styles.badgeText,
                {
                  color: activeTab === tab.id ? palette.onAccent : palette.cyanInk,
                },
              ]}
            >
              {tab.count > 99 ? '99+' : tab.count}
            </Text>
            </View>
          )}
          </View>
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
    borderRadius: Radii.lg,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  tabContentStacked: { flexDirection: 'column' },
  label: {
    maxWidth: '100%',
    flexShrink: 1,
    minWidth: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.xs,
    minWidth: 22,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.full,
  },
  badgeText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    lineHeight: 18,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
