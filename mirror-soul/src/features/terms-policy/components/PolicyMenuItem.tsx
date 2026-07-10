import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { usePressAnimation } from '../hooks/useTermsPolicyAnimations';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

interface PolicyMenuItemProps {
  title: string;
  iconColor: string;
  iconBgColor: string;
  url: string;
  isLast?: boolean;
}

export const PolicyMenuItem = ({
  title,
  iconColor,
  iconBgColor,
  url,
  isLast = false,
}: PolicyMenuItemProps) => {
  const { handlePressIn, handlePressOut, animatedStyle } = usePressAnimation();
  const { colors, animatedText, animatedBorder } = useAnimatedTheme();

  const handlePress = async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, !isLast && styles.borderBottom, !isLast && animatedBorder]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          <Feather name="file-text" size={16} color={iconColor} />
        </View>

        <Animated.Text style={[styles.title, animatedText]}>{title}</Animated.Text>

        <Feather name="chevron-right" size={16} color={colors.text.muted} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 0.61,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
