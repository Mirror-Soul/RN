import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const CustomerCenterHeader = () => {
  const router = useRouter();
  const { colors, animatedGlassBackground, animatedText } = useAnimatedTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(0).duration(500).springify()}
      style={styles.container}
    >
      <Pressable
        onPress={() => router.navigate('/(main)/profile')}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Animated.View style={[styles.backButton, animatedGlassBackground]}>
          <Feather name="arrow-left" size={20} color={colors.text.primary} />
        </Animated.View>
      </Pressable>

      <View style={styles.titleContainer} pointerEvents="none">
        <Animated.Text style={[styles.title, animatedText]}>고객센터</Animated.Text>
      </View>

      <View style={styles.placeholder} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    width: '100%',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 0.61,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.44,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
