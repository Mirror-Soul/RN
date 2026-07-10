import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NotificationHeader } from './components/NotificationHeader';
import { NotificationItem } from './components/NotificationItem';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const { timeLimitAlert, eventAlert, handleToggleTimeLimit, handleToggleEvent } = useNotificationSettings();
  const { animatedBackground, animatedGlassBackground } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <NotificationHeader />

        <Animated.View
          entering={FadeInDown.delay(100).duration(550).springify()}
          style={[styles.card, animatedGlassBackground]}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
});
