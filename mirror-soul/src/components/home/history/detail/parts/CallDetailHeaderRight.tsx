import React, { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { HistoryMenuAnchor } from '../historyMenuLayout';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';

interface CallDetailHeaderRightProps {
  onCallPress: () => void;
  onMorePress: () => void;
  callDisabled?: boolean;
  callBusy?: boolean;
  menuExpanded?: boolean;
  onMenuAnchorChange?: (anchor: HistoryMenuAnchor) => void;
}

/** Target and native call lifecycle remain in the screen; each control has its own touch area. */
export default function CallDetailHeaderRight({ onCallPress, onMorePress, callDisabled = false, callBusy = false, menuExpanded = false, onMenuAnchorChange }: CallDetailHeaderRightProps) {
  const { colors, palette } = useMatchingDesign();
  const menuRef = useRef<View>(null);
  const { width, height, fontScale } = useWindowDimensions();
  const measureMenu = useCallback(() => menuRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
    if (measuredWidth > 0 && measuredHeight > 0) onMenuAnchorChange?.({ x, y, width: measuredWidth, height: measuredHeight });
  }), [onMenuAnchorChange]);
  useEffect(() => {
    const frame = requestAnimationFrame(measureMenu);
    return () => cancelAnimationFrame(frame);
  }, [width, height, fontScale, menuExpanded, measureMenu]);
  const sharedStyle = { backgroundColor: colors.background.glass, borderColor: colors.border.primary };
  return <View style={styles.container}>
    <TouchableOpacity style={[styles.iconButton, { ...sharedStyle, opacity: callDisabled || callBusy ? 0.45 : 1 }]}
      onPress={onCallPress} disabled={callDisabled || callBusy} activeOpacity={0.7}
      accessibilityRole="button" accessibilityLabel="상대의 AI 트윈과 통화" accessibilityState={{ disabled: callDisabled || callBusy, busy: callBusy }}>
      {callBusy ? <ActivityIndicator size="small" color={palette.cyanInk} /> : <Feather name="phone" size={20} color={colors.text.primary} />}
    </TouchableOpacity>
    <View ref={menuRef} collapsable={false} onLayout={measureMenu}><TouchableOpacity style={[styles.iconButton, sharedStyle, menuExpanded && { backgroundColor: palette.coolTint, borderColor: palette.softBorder }]} onPress={onMorePress} activeOpacity={0.7}
      accessibilityRole="button" accessibilityLabel="통화 기록 메뉴" accessibilityState={{ expanded: menuExpanded }}>
      <Feather name="menu" size={20} color={colors.text.primary} />
    </TouchableOpacity></View>
  </View>;
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { width: 48, height: 48, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', alignItems: 'center' },
});
