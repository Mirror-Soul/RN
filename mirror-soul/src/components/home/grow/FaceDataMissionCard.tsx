import React from 'react';
import { router } from 'expo-router';
import GrowthMissionCard from './GrowthMissionCard';

export default function FaceDataMissionCard() {
  return <GrowthMissionCard title="얼굴 데이터" subtitle="새로운 얼굴 영상으로 트윈을 다시 학습해요. 약 20~25초면 충분해요."
    status="다시 촬영" icon="camera" onPress={() => router.push('/face-data-update')} accessibilityLabel="얼굴 데이터 다시 촬영하기" />;
}
