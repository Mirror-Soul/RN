import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

interface CallDetailAlertProps {
  name: string;
  /** Clone.syncRate — 상대방의 AI 트윈이 상대방 본인을 얼마나 정확히 반영했는지. null이면 배너를 숨긴다. */
  twinSyncRate: number | null;
}

/**
 * 통화 상세 상단 안내 배너 (SRP)
 * twinSyncRate는 "나와 상대방의 궁합"이 아니라 "상대방의 AI 트윈이 상대방 본인을 얼마나
 * 정확히 반영했는지"를 뜻한다 — 예전 카피("유사도가 높아 대화가 잘 통할 확률이 높아요")는
 * 궁합처럼 오해하게 만들어서 고쳤다. 데이터가 없으면(twinSyncRate === null) 렌더링하지 않는다.
 */
export default function CallDetailAlert({ name, twinSyncRate }: CallDetailAlertProps) {
  if (twinSyncRate === null) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Feather name="zap" size={14} color={Colors.primary.electricCyan} />
        <Text style={styles.text}>
          이 AI 트윈은 {name}님을 {twinSyncRate}% 정확도로 반영해 만들어졌어요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.cyan20_d3,
    backgroundColor: Colors.glass.cyan10_d3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  text: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 16,
  },
});
