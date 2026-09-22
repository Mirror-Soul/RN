import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { Spacing } from '@/src/constants/theme';
import { ProfileDigitalVoiceSection } from './components/ProfileDigitalVoiceSection';
import { ProfileHeroSection } from './components/ProfileHeroSection';
import { ProfileInfoOverlay } from './components/ProfileInfoOverlay';
import { ProfilePersonaSection } from './components/ProfilePersonaSection';
import { ProfileRecordSection } from './components/ProfileRecordSection';
import { ProfileSettingsBanner } from './components/ProfileSettingsBanner';
import { useProfileQuery } from './hooks/useProfileQuery';
import type { ProfileViewData } from './types';

/**
 * 백엔드가 아직 제공하지 않는 소개용 상세 필드는 기존 프로필 UI의 표현을 보존한다.
 * 이름만 GET /my-page 응답으로 교체하며, 상세 소개 API가 준비되면 이 값을 서버 데이터로 바꾼다.
 */
const legacyIntroduction: Omit<ProfileViewData, 'name'> = {
  age: 27,
  mbti: 'INTJ',
  twinSimilarity: 73,
  location: '서울, 강남구',
  job: '프로덕트 디자이너',
  isPremium: true,
  bio: '좋은 대화는 서로를 조금 더 이해하게 만든다고 믿어요.\n편안한 이야기부터 천천히 시작해요.',
  voiceTitle: '신뢰감 있고 명확한 목소리',
  voiceClipDuration: '0:12',
  personaTags: ['깊이 있는 대화', '차분한 공감', '새로운 경험'],
  isOwnProfile: true,
};

/** 기존 프로필 소개 화면을 분리해, 메인 마이페이지의 실제 계정·시간 정보와 함께 유지한다. */
export const ProfileIntroductionScreen = () => {
  const router = useRouter();
  const { data: profile } = useProfileQuery();
  const introduction = useMemo<ProfileViewData>(
    () => ({
      ...legacyIntroduction,
      name: profile?.name?.trim() || '내 프로필',
    }),
    [profile?.name],
  );

  const openAccountSettings = () => router.push('/(main)/account');

  return (
    <ScreenLayout withScroll={true} centerContent={false} paddingBottomOffset={112}>
      <Header title="내 소개" />
      <ProfileHeroSection
        avatarUrl={introduction.avatarUrl}
        isOwnProfile={introduction.isOwnProfile}
        onSettingsPress={openAccountSettings}
      />
      <ProfileInfoOverlay
        name={introduction.name}
        age={introduction.age}
        mbti={introduction.mbti}
        twinSimilarity={introduction.twinSimilarity}
        location={introduction.location}
        job={introduction.job}
        isPremium={introduction.isPremium}
        isOwnProfile={introduction.isOwnProfile}
        onEditPress={openAccountSettings}
      />
      <View style={{ paddingHorizontal: Spacing.xxl }}>
        <ProfilePersonaSection tags={introduction.personaTags} />
        <ProfileDigitalVoiceSection
          voiceTitle={introduction.voiceTitle}
          duration={introduction.voiceClipDuration}
        />
        <ProfileRecordSection bio={introduction.bio} />
        <ProfileSettingsBanner />
      </View>
    </ScreenLayout>
  );
};
