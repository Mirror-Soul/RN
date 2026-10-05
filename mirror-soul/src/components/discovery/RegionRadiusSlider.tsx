import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';

interface RegionRadiusSliderProps {
  steps: number[];
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}
const THUMB_SIZE = 24;

/** 48px touch surface plus full-width step buttons. Vertical movement remains available to the panel. */
export default function RegionRadiusSlider({ steps, value, onValueChange, disabled = false }: RegionRadiusSliderProps) {
  const { colors, palette } = useMatchingDesign();
  const width = useSharedValue(0);
  const index = useSharedValue(Math.max(0, steps.indexOf(value)));
  const count = steps.length;
  useEffect(() => { index.value = Math.max(0, steps.indexOf(value)); }, [steps, value, index]);
  const notify = useCallback((next: number) => {
    const step = steps[next];
    if (!disabled && step != null) onValueChange(step);
  }, [disabled, steps, onValueChange]);
  const update = (x: number) => {
    'worklet';
    if (width.value <= THUMB_SIZE || count <= 1) return;
    const fraction = Math.min(1, Math.max(0, (x - THUMB_SIZE / 2) / (width.value - THUMB_SIZE)));
    const next = Math.round(fraction * (count - 1));
    if (index.value !== next) { index.value = next; runOnJS(notify)(next); }
  };
  const pan = Gesture.Pan().enabled(!disabled).activeOffsetX([-4, 4]).failOffsetY([-12, 12])
    .onStart(event => update(event.x)).onUpdate(event => update(event.x));
  const tap = Gesture.Tap().enabled(!disabled).maxDistance(8).onEnd((event, success) => { if (success) update(event.x); });
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: count > 1 ? index.value / (count - 1) * Math.max(0, width.value - THUMB_SIZE) : 0 }] }));
  const fill = useAnimatedStyle(() => ({ width: THUMB_SIZE / 2 + (count > 1 ? index.value / (count - 1) * Math.max(0, width.value - THUMB_SIZE) : 0) }));
  return <View style={{ opacity: disabled ? 0.5 : 1 }}>
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View testID="region-radius-touch-surface" style={styles.touchSurface} onLayout={event => { width.value = event.nativeEvent.layout.width; }} accessible={false}>
        <View pointerEvents="none" style={[styles.track, { backgroundColor: colors.border.primary }]} />
        <Animated.View pointerEvents="none" style={[styles.fill, { backgroundColor: palette.cyanInk }, fill]} />
        <View pointerEvents="none" style={styles.ticks}>{steps.map(step => <View key={step} style={[styles.tick, { backgroundColor: colors.text.muted }]} />)}</View>
        <Animated.View pointerEvents="none" style={[styles.thumb, { backgroundColor: colors.background.card, borderColor: palette.cyanInk }, thumb]} />
      </View>
    </GestureDetector>
    <View style={styles.buttons}>{steps.map(step => <Pressable key={step} disabled={disabled} onPress={() => notify(steps.indexOf(step))}
      accessibilityRole="radio" accessibilityLabel={`${step}개 동 선택`} accessibilityState={{ selected: step === value, disabled }}
      style={({ pressed }) => [styles.button, { borderColor: step === value ? palette.cyanInk : colors.border.primary, backgroundColor: step === value || pressed ? palette.coolTint : colors.background.card }]}>
      <Text style={[styles.label, { color: step === value ? palette.cyanInk : colors.text.secondary }]}>{step}개</Text>
    </Pressable>)}</View>
  </View>;
}
const styles = StyleSheet.create({
  touchSurface: { height: 48, justifyContent: 'center' },
  track: { position: 'absolute', left: 12, right: 12, height: 4, borderRadius: 2 },
  fill: { position: 'absolute', height: 4, borderRadius: 2 },
  ticks: { marginHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between' },
  tick: { width: 2, height: 10, borderRadius: 1 },
  thumb: { position: 'absolute', height: THUMB_SIZE, width: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, borderWidth: 2 },
  buttons: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, minWidth: 0, minHeight: 44, borderWidth: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, lineHeight: 22, fontWeight: '600' },
});
