import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { AccessibilityInfo, Keyboard, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors } from '@/src/constants/theme';
import { BrowseIcon } from '../common/BrowseIcon';
import { BrowseText } from '../common/BrowseText';
import { tabBarGeometry } from './tabBarGeometry';
import { TabBarCompactContext, TabBarScrollContext } from '@/src/components/common/TabBarScrollContext';

export type BottomTabId = 'history' | 'grow' | 'discover' | 'match' | 'profile';
const TABS = [
  { id: 'history', label: '기록', icon: 'clock' },
  { id: 'grow', label: '성장', icon: 'plant' },
  { id: 'discover', label: '발견', icon: 'compass' },
  { id: 'match', label: '매칭', icon: 'users' },
  { id: 'profile', label: '프로필', icon: 'user-circle' },
] as const;

function TabButton({ tab, selected, compact, progress, labelHeight, width, ink, muted, fill, pressedFill, selectedBorder, onPress, onLongPress }: {
  tab: typeof TABS[number]; selected: boolean; compact: boolean; progress: SharedValue<number>; labelHeight: number; width?: number;
  ink: string; muted: string; fill: string; pressedFill: string; selectedBorder: string; onPress: () => void; onLongPress: () => void;
}) {
  const labelMotion = useAnimatedStyle(() => ({
    height: labelHeight * (1 - progress.value), marginTop: 4 * (1 - progress.value), opacity: Math.max(0, 1 - progress.value / 0.65),
  }));
  return <Pressable testID={`main-tab-${tab.id}`} accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected }}
    onPress={onPress} onLongPress={onLongPress}
    style={({ pressed }) => [styles.tab, width ? { width } : styles.equalTab,
      { backgroundColor: selected ? fill : pressed ? pressedFill : 'transparent', borderColor: selected ? selectedBorder : 'transparent' }, pressed && { opacity: 0.75 }]}>
    <BrowseIcon name={tab.icon} size={24} color={selected ? ink : muted} />
    <Animated.View accessibilityElementsHidden={compact} importantForAccessibility={compact ? 'no-hide-descendants' : 'auto'}
      style={[{ alignSelf: 'stretch', overflow: 'hidden' }, labelMotion]}>
      <BrowseText style={[styles.label, { color: selected ? ink : muted, fontWeight: selected ? '600' : '500' }]}>{tab.label}</BrowseText>
    </Animated.View>
  </Pressable>;
}

interface BottomNavbarProps {
  activeTab?: BottomTabId;
  activeRoute?: string;
  onTabPress?: (tab: BottomTabId) => void;
  onTabLongPress?: (tab: BottomTabId) => void;
  onObstructionHeightChange?: (height: number) => void;
}

export default function BottomNavbar({ activeTab = 'discover', activeRoute, onTabPress, onTabLongPress, onObstructionHeightChange }: BottomNavbarProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors();
  const { sizeClass } = useLayout();
  const { width, fontScale } = useWindowDimensions();
  const geometry = tabBarGeometry(width, insets.left, insets.right, fontScale, sizeClass);
  const layoutKey = `${geometry.width}:${fontScale}`;
  const [measurement, setMeasurement] = useState({ key: '', height: 0 });
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(() => Keyboard.isVisible());
  const height = measurement.key === layoutKey && measurement.height > 0 ? measurement.height : geometry.estimatedHeight;
  const wantsCompact = useContext(TabBarCompactContext);
  const compact = wantsCompact && geometry.canCompact;
  const scrollController = useContext(TabBarScrollContext);
  const compactProgress = useSharedValue(0);
  const [labelMeasurement, setLabelMeasurement] = useState({ key: '', height: 0 });
  const labelHeight = labelMeasurement.key === layoutKey && labelMeasurement.height > 0 ? labelMeasurement.height : 16 * fontScale;
  const [reduceMotion, setReduceMotion] = useState(false);
  const route = activeRoute ?? (activeTab === 'discover' ? 'index' : activeTab);

  useLayoutEffect(() => { scrollController?.activate(route); }, [scrollController, route, layoutKey]);

  useEffect(() => {
    compactProgress.value = reduceMotion ? (compact ? 1 : 0) : withTiming(compact ? 1 : 0, { duration: 280 });
    return () => cancelAnimation(compactProgress);
  }, [compact, compactProgress, reduceMotion]);

  const surfaceMotion = useAnimatedStyle(() => ({
    width: geometry.width + (geometry.compactWidth - geometry.width) * compactProgress.value,
    left: (geometry.width - geometry.compactWidth) / 2 * compactProgress.value,
  }));
  const rowMotion = useAnimatedStyle(() => ({ paddingVertical: 8 - 4 * compactProgress.value }));

  useEffect(() => {
    let current = true;
    let changed = false;
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { changed = true; setReduceMotion(value); });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (current && !changed) setReduceMotion(value); }, () => {});
    return () => { current = false; listener.remove(); };
  }, []);

  useEffect(() => {
    onObstructionHeightChange?.(keyboardVisible ? 0 : height + insets.bottom + geometry.bottomGap);
  }, [height, insets.bottom, geometry.bottomGap, keyboardVisible, onObstructionHeightChange]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false); scrollController?.activate(route); });
    return () => { show.remove(); hide.remove(); };
  }, [scrollController, route]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let current = true;
    let changed = false;
    const listener = AccessibilityInfo.addEventListener('reduceTransparencyChanged', value => { changed = true; setReduceTransparency(value); });
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (current && !changed) setReduceTransparency(value); }, () => {});
    return () => { current = false; listener.remove(); };
  }, []);

  if (keyboardVisible) return null;
  const opaque = reduceTransparency || Platform.OS !== 'ios';
  const surface = reduceTransparency ? colors.background.elevated
    : Platform.OS !== 'ios' ? isDark ? 'rgba(32, 34, 37, 0.97)' : 'rgba(255, 255, 255, 0.97)'
      : isDark ? 'rgba(28, 30, 33, 0.78)' : 'rgba(255, 255, 255, 0.76)';
  const ink = isDark ? Colors.primary.electricCyan : '#006477';
  const selectedFill = isDark ? 'rgba(0, 211, 243, 0.13)' : 'rgba(0, 211, 243, 0.10)';
  const items = TABS.map(tab => <TabButton key={tab.id} tab={tab} selected={tab.id === activeTab} compact={compact}
    progress={compactProgress} labelHeight={labelHeight} width={geometry.scrollable ? geometry.tabWidth : undefined}
    ink={ink} muted={colors.text.secondary} fill={selectedFill} pressedFill={colors.background.glass}
    selectedBorder={isDark ? 'rgba(0, 211, 243, 0.20)' : 'rgba(0, 100, 119, 0.13)'}
    onPress={() => { scrollController?.activate(route); onTabPress?.(tab.id); }} onLongPress={() => onTabLongPress?.(tab.id)} />);
  // The invisible expanded measure reserves stable list padding throughout the animation.
  return <View pointerEvents="box-none" testID="main-tab-bar"
    onLayout={event => setMeasurement({ key: layoutKey, height: event.nativeEvent.layout.height })}
    style={[styles.wrapper, { width: geometry.width, left: geometry.left, bottom: insets.bottom + geometry.bottomGap }]}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.surface, { opacity: 0 }]}>
      <View style={[styles.row, { paddingHorizontal: geometry.paddingHorizontal }]}>
        {TABS.map(tab => <View key={tab.id} style={[styles.tab, { minHeight: 56, gap: 4 }, geometry.scrollable ? { width: geometry.tabWidth } : styles.equalTab]}>
          <View style={{ width: 24, height: 24 }} />
          <BrowseText onLayout={event => {
            const measured = event.nativeEvent.layout.height;
            if (measured > 0) setLabelMeasurement(previous => ({ key: layoutKey, height: Math.max(previous.key === layoutKey ? previous.height : 0, measured) }));
          }} style={[styles.label, { fontWeight: tab.id === activeTab ? '600' : '500' }]}>{tab.label}</BrowseText>
        </View>)}
      </View>
    </View>
    <Animated.View testID="main-tab-visible-surface" style={[styles.shadow, { position: 'absolute', bottom: 0 }, surfaceMotion]}>
      <View style={[styles.surface, { borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)' }]}>
        {!opaque && <BlurView testID="main-tab-blur" pointerEvents="none" intensity={55} tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'} style={StyleSheet.absoluteFill} />}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: surface }]} />
        {geometry.scrollable ? <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={[styles.row, { paddingHorizontal: geometry.paddingHorizontal }]}>{items}</ScrollView>
          : <Animated.View style={[styles.row, { paddingHorizontal: geometry.paddingHorizontal }, rowMotion]}>{items}</Animated.View>}
      </View>
    </Animated.View>
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', zIndex: 1000 },
  shadow: { borderRadius: 28, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6 },
  surface: { borderRadius: 28, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: 8 },
  tab: { minHeight: 48, minWidth: 48, paddingHorizontal: 2, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 20 },
  equalTab: { flex: 1 },
  label: { fontSize: 11, lineHeight: 16, textAlign: 'center', alignSelf: 'stretch', flexShrink: 1 },
});
