import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

/**
 * 통화 상세 하단 푸터 (SRP)
 * 답변 수정 시 실제로 일어나는 일(저장)만 안내하는 pill 배지를 표시합니다.
 * "Twin 학습에 반영" 같은 문구는 쓰지 않는다 — PATCH /talk-logs/{id}는 TalkLog 텍스트만
 * 갱신할 뿐 클론 재학습 파이프라인을 트리거하지 않는다(HistoryService.updateTalkLog 확인).
 */
export default function CallDetailFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Feather name="zap" size={12} color={Colors.primary.electricCyan} />
        <Text style={styles.text}>수정한 답변은 이 대화 기록에 저장됩니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: 0.612,
    borderTopColor: Colors.glass.white10,
    backgroundColor: Colors.glass.black40,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20_d3,
  },
  text: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
});
