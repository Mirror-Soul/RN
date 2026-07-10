import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const NotificationHeader = () => {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.delay(0).duration(500).springify()}
      style={styles.container}
    >
      {/* 뒤로가기 버튼 */}
      <Pressable
        onPress={() => router.navigate('/(main)/profile')}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="arrow-left" size={20} color="#FFFFFF" />
      </Pressable>

      {/* 타이틀 (가운데 정렬) */}
      <View style={styles.titleContainer} pointerEvents="none">
        <Text style={styles.title}>알림 설정</Text>
      </View>

      {/* 우측 균형용 빈 공간 */}
      <View style={styles.placeholder} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 40,
    width: '100%',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});
