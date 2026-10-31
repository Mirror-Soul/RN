import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageRoomHeaderLeft } from './MessageRoomHeaderLeft';
import { OptionsProfileSection } from './options/OptionsProfileSection';
import type { ChatRoom } from '../types';

jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.requireActual('react-native').View }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('@/src/features/profile/photo/useRetryableProfileImage', () => ({
  useRetryableProfileImage: () => ({ failed: false, imageKey: 0, onError: jest.fn(), retry: jest.fn(), isReloading: false }),
}));

const room = (twinSimilarity: number | null): ChatRoom => ({
  chatRoomId: 1, unreadCount: 0, notificationEnabled: true, createdAt: '2026-10-05T14:30:00', lastMessage: null,
  partner: { userUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: '지수', age: 26, profileImageUrl: null, twinSimilarity, lastActiveAt: null },
});

describe('twin similarity in a message room', () => {
  it('hides the similarity instead of showing a permanent “analyzing” state when no analysis exists', () => {
    const header = render(<MessageRoomHeaderLeft room={room(null)} />);
    expect(header.queryByText(/유사도/)).toBeNull();
    expect(header.getByText('활동 정보 없음')).toBeTruthy();
    const options = render(<OptionsProfileSection room={room(null)} onPress={jest.fn()} />);
    expect(options.queryByText(/유사도/)).toBeNull();
  });

  it('shows the similarity when the backend provides it', () => {
    const header = render(<MessageRoomHeaderLeft room={room(87)} />);
    expect(header.getByText('유사도 87%')).toBeTruthy();
    const options = render(<OptionsProfileSection room={room(87)} onPress={jest.fn()} />);
    expect(options.getByText('트윈 유사도 87%')).toBeTruthy();
  });
});
