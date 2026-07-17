import { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';

export interface ProfileItem {
  id: string;
  label: string;
  description?: string;
  iconName: keyof typeof Feather.glyphMap;
  iconColor: string;
  iconBgColor: string;
}

export interface ProfileSection {
  id: string;
  title: string;
  items: ProfileItem[];
}

export interface InterestItem {
  id: string;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  iconColor: string;
}

export interface ProfileViewData {
  name: string;
  age: number;
  mbti: string;
  twinSimilarity: number;
  location: string;
  job: string;
  isPremium: boolean;
  bio: string;
  voiceTitle: string;
  voiceClipDuration: string;
  personaTags: string[];
  avatarUrl?: string;
  isOwnProfile: boolean;
}
