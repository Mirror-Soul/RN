import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NotificationItem } from './components/NotificationItem';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

export const NotificationScreen = () => {
  const { timeLimitAlert, eventAlert, handleToggleTimeLimit, handleToggleEvent } = useNotificationSettings();
  const { colors } = useThemeColors();

  return (
    <ScreenLayout withScroll={true}>
      <Header title="알림 설정" delay={0} />

      <View style={styles.contentPadding}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(550).springify()}
          style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
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
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: 24,
  },
  card: {
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
});
