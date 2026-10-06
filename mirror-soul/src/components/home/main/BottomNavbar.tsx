import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Keyboard, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors } from '@/src/constants/theme';
import { BrowseIcon } from '../common/BrowseIcon';
import { BrowseText } from '../common/BrowseText';
import { tabBarGeometry } from './tabBarGeometry';
import { TabBarHiddenContext, TabBarScrollContext } from '@/src/components/common/TabBarScrollContext';

export type BottomTabId = 'history' | 'grow' | 'discover' | 'match' | 'profile';
const TABS = [
  { id: 'history', label: '기록', icon: 'clock' },
  { id: 'grow', label: '성장', icon: 'plant' },
  { id: 'discover', label: '발견', icon: 'compass' },
  { id: 'match', label: '매칭', icon: 'users' },
  { id: 'profile', label: '프로필', icon: 'user-circle' },
] as const;

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
  const hidden = useContext(TabBarHiddenContext);
  const scrollController = useContext(TabBarScrollContext);
  const hiddenProgress = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  const route = activeRoute ?? (activeTab === 'discover' ? 'index' : activeTab);

  useLayoutEffect(() => { scrollController?.activate(route); }, [scrollController, route, layoutKey]);

  useEffect(() => {
    if (reduceMotion) { hiddenProgress.setValue(hidden ? 1 : 0); return; }
    const animation = Animated.timing(hiddenProgress, { toValue: hidden ? 1 : 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [hidden, hiddenProgress, reduceMotion]);

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
  const items = TABS.map(tab => {
    const selected = tab.id === activeTab;
    return <Pressable
      key={tab.id}
      testID={`main-tab-${tab.id}`}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected }}
      onPress={() => onTabPress?.(tab.id)}
      onLongPress={() => onTabLongPress?.(tab.id)}
      style={({ pressed }) => [styles.tab, geometry.scrollable ? { width: geometry.tabWidth } : styles.equalTab,
        { backgroundColor: selected ? selectedFill : pressed ? colors.background.glass : 'transparent',
          borderColor: selected ? isDark ? 'rgba(0, 211, 243, 0.20)' : 'rgba(0, 100, 119, 0.13)' : 'transparent' },
        pressed && { opacity: 0.75 }]}
    >
      <BrowseIcon name={tab.icon} size={24} color={selected ? ink : colors.text.secondary} />
      <BrowseText style={[styles.label, { color: selected ? ink : colors.text.secondary, fontWeight: selected ? '600' : '500' }]}>
        {tab.label}
      </BrowseText>
    </Pressable>;
  });
  // Keep measured layout padding while hidden so list size/offset never jumps.
  return <Animated.View pointerEvents={hidden ? 'none' : 'box-none'} testID="main-tab-bar"
    accessibilityElementsHidden={hidden} importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
    onLayout={event => setMeasurement({ key: layoutKey, height: event.nativeEvent.layout.height })}
    style={[styles.wrapper, { width: geometry.width, left: geometry.left, bottom: insets.bottom + geometry.bottomGap,
      transform: [{ translateY: hiddenProgress.interpolate({ inputRange: [0, 1], outputRange: [0, height + insets.bottom + geometry.bottomGap + 24] }) }] }]}>
    <View style={styles.shadow}>
      <View style={[styles.surface, { borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)' }]}>
        {!opaque && <BlurView testID="main-tab-blur" pointerEvents="none" intensity={55} tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'} style={StyleSheet.absoluteFill} />}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: surface }]} />
        {geometry.scrollable ? <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={[styles.row, { paddingHorizontal: geometry.paddingHorizontal }]}>{items}</ScrollView>
          : <View style={[styles.row, { paddingHorizontal: geometry.paddingHorizontal }]}>{items}</View>}
      </View>
    </View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', zIndex: 1000 },
  shadow: { borderRadius: 28, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12, elevation: 6 },
  surface: { borderRadius: 28, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: 8 },
  tab: { minHeight: 56, minWidth: 48, paddingHorizontal: 2, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderRadius: 20 },
  equalTab: { flex: 1 },
  label: { fontSize: 11, lineHeight: 16, textAlign: 'center', alignSelf: 'stretch', flexShrink: 1 },
});
