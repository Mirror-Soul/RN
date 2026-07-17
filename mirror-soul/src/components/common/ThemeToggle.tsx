import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { useSwitchToggle } from '@/src/animations/patterns/useSwitchToggle';

export const ThemeToggle = () => {
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors } = useThemeColors();
  
  const options = [
    { id: 'system', label: '기기 설정' },
    { id: 'light', label: '라이트' },
    { id: 'dark', label: '다크' }
  ] as const;

  const selectedIndex = options.findIndex((opt) => opt.id === themeMode);

  const { indicatorStyle } = useSwitchToggle({
    selectedIndex,
    totalSegments: options.length,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <Animated.View 
        style={[
          styles.indicator, 
          { backgroundColor: colors.background.card, borderColor: colors.border.strong, shadowColor: colors.text.primary },
          indicatorStyle
        ]} 
      />
      
      {options.map((opt, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <Pressable 
            key={opt.id}
            onPress={() => setThemeMode(opt.id)}
            style={styles.optionBtn}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${opt.label} 모드`}
          >
            <Text style={[
              styles.optionLabel, 
              { color: isSelected ? colors.text.primary : colors.text.muted },
              isSelected && styles.optionLabelSelected
            ]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    borderWidth: 0.61,
    padding: Spacing.xxs,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    width: '33.333%',
    borderRadius: Radii.lg2,
    borderWidth: 0.61,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  optionLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
  },
  optionLabelSelected: {
    fontWeight: FontWeight.semibold,
  }
});
