import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface PolicyMenuItemProps {
  title: string;
  iconBgColor: string;
  iconColor: string;
  url: string;
  isLast?: boolean;
}

/**
 * 개별 약관 및 정책 항목 컴포넌트
 * (스케일 터치 애니메이션 및 실무 외부 링크 연동 지원)
 */
export const PolicyMenuItem = ({ title, iconBgColor, iconColor, url, isLast = false }: PolicyMenuItemProps) => {
  const scale = useSharedValue(1);

  // 부드러운 스케일 축소 효과 (최신 트렌드 UX)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // 외부 브라우저 호출 (인앱 브라우저 아님)
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn('Cannot open URL:', url);
      }
    } catch (e) {
      console.error('Error opening URL:', e);
    }
  };

  return (
    <Animated.View style={[styles.container, !isLast && styles.borderBottom, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.pressable}
      >
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          {/* 아이콘은 성격에 맞게 매핑 */}
          {title === '서비스 이용약관' && <Feather name="file-text" size={16} color={iconColor} />}
          {title === '개인정보 처리방침' && <Feather name="shield" size={16} color={iconColor} />}
          {title === '오픈소스 라이선스' && <Feather name="code" size={16} color={iconColor} />}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Feather name="chevron-right" size={16} color="#4A5565" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  borderBottom: {
    borderBottomWidth: 0.61,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
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
    color: '#FFFFFF',
  },
});
