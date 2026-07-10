import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useRouter } from 'expo-router';

interface FooterActionsProps {
  delay?: number;
}

export const FooterActions = ({ delay = 400 }: FooterActionsProps) => {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.container}
    >
      <Pressable 
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={() => router.navigate('/(main)/account')}
      >
        <Text style={styles.text}>계정 관리</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    gap: 16,
    width: '100%',
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: '#4A5565',
  },
  divider: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.31,
    color: '#364153',
  },
});
