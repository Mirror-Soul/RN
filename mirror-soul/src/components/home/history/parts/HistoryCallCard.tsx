import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CallProfile from './HistoryCallCard/CallProfile';
import CallSubInfo from './HistoryCallCard/CallSubInfo';
import CallTagRow from './HistoryCallCard/CallTagRow';

export interface HistoryCallItemData {
  id: string;
  name: string;
  age: number;
  consistencyPercent: number;
  dateStr: string;
  timeStr: string;
  profileImageUrl?: string;
  callTypeDesc: string;
  durationLabel: string;
  twinMatchLabel: string;
  tags: string[];
}

interface HistoryCallCardProps {
  data: HistoryCallItemData;
}

/**
 * 개별 통화 기록 단위 카드 컴포넌트
 */
export default function HistoryCallCard({ data }: HistoryCallCardProps) {
  return (
    <View style={styles.container}>
      <CallProfile
        name={data.name}
        age={data.age}
        consistencyPercent={data.consistencyPercent}
        dateStr={data.dateStr}
        timeStr={data.timeStr}
        profileImageUrl={data.profileImageUrl}
        callTypeDesc={data.callTypeDesc}
      />
      <CallSubInfo
        durationLabel={data.durationLabel}
        twinMatchLabel={data.twinMatchLabel}
      />
      <CallTagRow tags={data.tags} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16.6,
    paddingHorizontal: 16.6,
    paddingBottom: 16.6, // 상단 여백과 동일하게 맞춤(16.6)
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12, // 11.992px 반올림
    alignSelf: 'stretch',
    borderRadius: Radii.lg, // 16px
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
});
