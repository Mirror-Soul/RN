import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedSwitch } from './AnimatedSwitch';

interface NotificationItemProps {
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

/**
 * 알림 설정 카드 내 개별 항목
 * 마지막 항목은 구분선(border-bottom)을 제거합니다.
 */
export const NotificationItem = ({
  title,
  description,
  value,
  onToggle,
  isLast = false,
}: NotificationItemProps) => {
  return (
    <View style={[styles.container, !isLast && styles.borderBottom]}>
      {/* 텍스트 영역 */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* 토글 스위치 */}
      <AnimatedSwitch value={value} onToggle={onToggle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  borderBottom: {
    borderBottomWidth: 0.61,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#FFFFFF',
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 20,
    color: '#6A7282',
    marginTop: 2,
  },
});
