import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ProfileHeroSection } from './components/ProfileHeroSection';
import { ProfileInfoOverlay } from './components/ProfileInfoOverlay';
import { ProfilePersonaSection } from './components/ProfilePersonaSection';
import { ProfileDigitalVoiceSection } from './components/ProfileDigitalVoiceSection';
import { ProfileRecordSection } from './components/ProfileRecordSection';
import { ProfileSettingsBanner } from './components/ProfileSettingsBanner';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

import { useAccountStore } from '@/src/store/useAccountStore';
import { NicknameEditModal } from '@/src/features/account/components/NicknameEditModal';
import { ProfileViewData } from './types';
import { Spacing } from '@/src/constants/theme';


// 목업 데이터: 추후 API/store로 교체
const MOCK_PROFILE: ProfileViewData = {
  name: '김소울',
  age: 27,
  mbti: 'INTJ',
  twinSimilarity: 73,
  location: '서울, 강남구',
  job: '프로덕트 디자이너',
  isPremium: true,
  bio: '기술과 인간의 감정이 교차하는 지점을 탐구합니다. 나의 디지털 트윈이 들려주는 이야기에 귀 기울여보세요.',
  voiceTitle: '신뢰감 있고 명확한 목소리',
  voiceClipDuration: '0:12',
  personaTags: ['논리적인', '차분한 관찰자', '심미안이 높은', '성찰하는'],
  isOwnProfile: true,
};

export const ProfileScreen = () => {
  const router = useRouter();
  const { nickname } = useAccountStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const profile: ProfileViewData = {
    ...MOCK_PROFILE,
    name: nickname || MOCK_PROFILE.name,
  };

  const handleSettingsPress = useCallback(() => {
    router.push('/(main)/profile-settings');
  }, [router]);

  return (
    <ScreenLayout withScroll={true} paddingBottomOffset={120}>
      {/* 1. 영웅 배경 섹션 */}
      <ProfileHeroSection
        avatarUrl={profile.avatarUrl}
        isOwnProfile={profile.isOwnProfile}
        onSettingsPress={handleSettingsPress}
      />

      {/* 2. 이름/뱃지/메타 정보 오버레이 */}
      <ProfileInfoOverlay
        name={profile.name}
        age={profile.age}
        mbti={profile.mbti}
        twinSimilarity={profile.twinSimilarity}
        location={profile.location}
        job={profile.job}
        isPremium={profile.isPremium}
        isOwnProfile={profile.isOwnProfile}
        onEditPress={() => setIsEditModalOpen(true)}
      />

      {/* 3. 컨텐츠 영역 */}
      <View style={styles.contentPadding}>
        {/* Persona Analysis */}
        <ProfilePersonaSection tags={profile.personaTags} delay={120} />

        {/* Digital Voice */}
        <ProfileDigitalVoiceSection
          voiceTitle={profile.voiceTitle}
          duration={profile.voiceClipDuration}
          delay={200}
        />

        {/* 나의 기록 */}
        <ProfileRecordSection bio={profile.bio} delay={280} />

        {/* 공간 관리 및 설정 배너 (내 프로필 전용) */}
        {profile.isOwnProfile && (
          <ProfileSettingsBanner delay={360} />
        )}
      </View>

      <NicknameEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.giant,
  },
});
