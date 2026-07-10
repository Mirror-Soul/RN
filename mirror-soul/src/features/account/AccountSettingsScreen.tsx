import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

import { NicknameEditModal } from './components/NicknameEditModal';
import { LogoutBottomSheet } from './components/LogoutBottomSheet';
import { useAccountStore } from '@/src/store/useAccountStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

export const AccountSettingsScreen = () => {
  const router = useRouter();
  const { nickname } = useAccountStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors } = useThemeColors();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState(false);
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleLogout = () => {
    setIsLogoutSheetOpen(true);
  };

  const handleCloseLogoutSheet = () => {
    setIsLogoutSheetOpen(false);
  };

  const performLogout = () => {
    console.log('로그아웃 처리');
    setIsLogoutSheetOpen(false);
    // TODO: useAuthStore().logout() 등 실제 로그아웃 로직
  };

  const handleWithdraw = () => {
    router.navigate('/(main)/account-delete');
  };

  return (
    <ScreenLayout withScroll={true}>
      <View style={styles.bgTopLeft} pointerEvents="none" />
      <View style={styles.bgBottomRight} pointerEvents="none" />

      <Header title="계정 관리" delay={0} />

      <Animated.View 
        entering={FadeInDown.delay(120).duration(550).springify()}
        style={styles.sectionContainer}
      >
        <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>닉네임</Text>
        
        <View style={[styles.cardContainer, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <Text style={[styles.nicknameText, { color: colors.text.primary }]}>{nickname}</Text>
          
          <Pressable onPress={handleOpenModal} style={styles.editButton}>
            <Feather name="edit-2" size={14} color={colors.brand.accent} />
            <Text style={[styles.editButtonText, { color: colors.brand.accent }]}>수정</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(180).duration(550).springify()}
        style={[styles.sectionContainer, { marginTop: 32 }]}
      >
        <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>디스플레이</Text>
        
        <View style={[styles.controlCardContainer, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <View style={styles.themeToggleRow}>
            <Text style={[styles.controlText, { color: colors.text.primary }]}>다크 모드</Text>
            <Pressable 
              style={[styles.toggleButton, themeMode === 'dark' && { backgroundColor: colors.brand.accent }]}
              onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            >
              <View style={[styles.toggleThumb, themeMode === 'dark' ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(240).duration(550).springify()}
        style={[styles.sectionContainer, { marginTop: 32 }]}
      >
        <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>계정 제어</Text>
        
        <View style={[styles.controlCardContainer, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <Pressable 
            style={({ pressed }) => [styles.controlRow, pressed && styles.controlRowPressed]}
            onPress={handleLogout}
          >
            <Text style={[styles.controlText, { color: colors.text.primary }]}>로그아웃</Text>
          </Pressable>
          
          <View style={[styles.divider, { borderColor: colors.border.primary }]} />
          
          <Pressable 
            style={({ pressed }) => [styles.controlRow, pressed && styles.controlRowPressed]}
            onPress={handleWithdraw}
          >
            <Text style={[styles.controlText, styles.destructiveText]}>회원 탈퇴</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(360).duration(550).springify()}
        style={styles.versionContainer}
      >
        <Text style={[styles.versionText, { color: colors.text.secondary }]}>현재 버전 {appVersion}</Text>
      </Animated.View>

      <NicknameEditModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <LogoutBottomSheet 
        isOpen={isLogoutSheetOpen} 
        onClose={handleCloseLogoutSheet} 
        onLogout={performLogout} 
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  bgTopLeft: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(125, 141, 240, 0.07)',
    top: -200,
    left: -150,
  },
  bgBottomRight: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(78, 218, 249, 0.05)',
    bottom: -100,
    right: -200,
  },
  sectionContainer: {
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 0.61,
    borderRadius: 16,
  },
  nicknameText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  },
  controlCardContainer: {
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlRow: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  controlRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  controlText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 15,
  },
  destructiveText: {
    color: '#FF4C4C',
  },
  divider: {
    height: 0,
    borderBottomWidth: 0.61,
    marginHorizontal: 20,
  },
  versionContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    alignSelf: 'flex-start',
  },
});
