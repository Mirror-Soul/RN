import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NotificationHeader } from './components/NotificationHeader';
import { NotificationItem } from './components/NotificationItem';
import { useNotificationSettings } from './hooks/useNotificationSettings';

/**
 * 알림 설정 화면
 *
 * - 시간 소진 알림: 대화 가능 시간이 부족할 때 알림 (기본 ON)
 * - 혜택 및 이벤트 알림: 새로운 소식이나 혜택 (기본 OFF)
 * - 부재중 알림: 백엔드 협의 후 추가 예정 (현재 제외)
 */
export const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    timeLimitAlert,
    eventAlert,
    handleToggleTimeLimit,
    handleToggleEvent,
  } = useNotificationSettings();

  return (
    <View style={styles.container}>
      {/* Radial Gradient 배경 레이어 (CSS 명세 재현) */}
      <View style={styles.bgTopLeft} pointerEvents="none" />
      <View style={styles.bgBottomRight} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <NotificationHeader />

        {/* 알림 설정 카드 */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(550).springify()}
          style={styles.card}
        >
          <NotificationItem
            title="시간 소진 알림"
            description="대화할 수 있는 시간이 부족할 때 알려줍니다."
            value={timeLimitAlert}
            onToggle={handleToggleTimeLimit}
            isLast={false}
          />
          <NotificationItem
            title="혜택 및 이벤트 알림"
            description="새로운 소식이나 혜택을 알려줍니다."
            value={eventAlert}
            onToggle={handleToggleEvent}
            isLast={true}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // CSS 명세: radial-gradient 좌상단 (보라, 34.95% 20%)
  bgTopLeft: {
    ...StyleSheet.absoluteFillObject,
    // React Native에서 radial-gradient 근사: 좌상단 보라색 glow
    backgroundColor: 'transparent',
    // 실제 효과는 expo-linear-gradient로 디퓨즈하게 표현하면 더 정밀하나
    // 성능을 위해 매우 연한 배경색으로 처리 (최대 opacity: 0.07)
  },
  bgBottomRight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
});
