import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export type MatchingTab = 'meet' | 'chat';

interface MatchingActionButtonsProps {
  activeTab: MatchingTab;
  onChangeTab: (tab: MatchingTab) => void;
}

export default function MatchingActionButtons({ activeTab, onChangeTab }: MatchingActionButtonsProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      {/* 만남 신청 버튼 */}
      <Pressable 
        style={[
          styles.button, 
          activeTab === 'meet' && [styles.activeButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary, shadowColor: Colors.primary.soulBlack }]
        ]}
        onPress={() => onChangeTab('meet')}
      >
        <Ionicons 
          name="people-outline" 
          size={16} 
          color={activeTab === 'meet' ? Colors.primary.electricCyan : colors.text.muted} 
        />
        <Text style={[styles.buttonText, { color: activeTab === 'meet' ? Colors.primary.electricCyan : colors.text.muted }]}>
          만남 신청
        </Text>
      </Pressable>

      {/* 메시지방 버튼 */}
      <Pressable 
        style={[
          styles.button, 
          activeTab === 'chat' && [styles.activeButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary, shadowColor: Colors.primary.soulBlack }]
        ]}
        onPress={() => onChangeTab('chat')}
      >
        <Ionicons 
          name="chatbubble-outline" 
          size={16} 
          color={activeTab === 'chat' ? Colors.primary.vividPurple : colors.text.muted} 
        />
        <View style={styles.textRow}>
          <Text style={[styles.buttonText, { color: activeTab === 'chat' ? Colors.primary.vividPurple : colors.text.muted }]}>
            메시지방
          </Text>
          {/* 배지 */}
          <View style={[styles.badge, { backgroundColor: activeTab === 'chat' ? Colors.primary.vividPurple : Colors.primary.electricCyan }]}>
            <Text style={[styles.badgeText, { color: Colors.primary.soulBlack }]}>2</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xxxl,
    flexDirection: 'row',
    padding: 6,
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.xl, 
    height: 64,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.lg, 
    paddingVertical: 14,
  },
  activeButton: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badge: {
    borderRadius: Radii.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
  },
});
