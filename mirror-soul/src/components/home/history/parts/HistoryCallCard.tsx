import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CallProfile from './HistoryCallCard/CallProfile';
import CallSubInfo from './HistoryCallCard/CallSubInfo';
import CallTagRow from './HistoryCallCard/CallTagRow';

/**
 * 통화 내 단일 메시지 데이터 모델 (SRP)
 */
export interface ChatMessage {
  id: string;
  direction: 'SENT' | 'RECEIVED'; // SENT = 나의 Twin, RECEIVED = 상대방
  text: string;
  timestamp: string;               // "11:15" 형식
  isEdited?: boolean;
}

export interface HistoryCallItemData {
  id: string;
  name: string;
  age: number;
  consistencyPercent: number;
  callSequenceNumber: number;      // N번 째 대화
  dateStr: string;
  timeStr: string;
  profileImageUrl?: string;
  direction: 'SENT' | 'RECEIVED';
  callTypeDesc: string;
  durationLabel: string;
  twinMatchLabel: string;
  tags: string[];
  messages: ChatMessage[];         // 통화 내 메시지 목록
}

interface HistoryCallCardProps {
  data: HistoryCallItemData;
  onPress?: () => void;
}

/**
 * 개별 통화 기록 단위 카드 컴포넌트
 */
export default function HistoryCallCard({ data, onPress }: HistoryCallCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
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
    </TouchableOpacity>
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
