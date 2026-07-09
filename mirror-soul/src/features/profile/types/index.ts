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
