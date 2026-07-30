import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

import { NicknameEditModal } from './components/NicknameEditModal';
import { LogoutBottomSheet } from './components/LogoutBottomSheet';
import { useAccountInfoQuery } from './hooks/useAccountInfoQuery';
import { useAuthStore } from '@/src/store/useAuthStore';
import { logout as logoutApi } from '@/src/services/authService';
import { logger } from '@/src/utils/logger';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { ThemeToggle } from '@/src/components/common/ThemeToggle';
import { SectionHeading } from '@/src/components/common/SectionHeading';
import {FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

export const AccountSettingsScreen = () => {
  const router = useRouter();
  const { data: accountInfo } = useAccountInfoQuery();
  const nickname = accountInfo?.name ?? '';
  const { colors } = useThemeColors();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleLogout = () => {
    setIsLogoutSheetOpen(true);
  };

  const handleCloseLogoutSheet = () => {
    setIsLogoutSheetOpen(false);
  };

  const performLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      // 서버 세션 정리가 실패해도 로컬 로그아웃(토큰 삭제)은 계속 진행
      logger.error('AccountSettingsScreen: /auth/logout failed', error);
    }
    await useAuthStore.getState().logout();
    setIsLogoutSheetOpen(false);
    router.replace('/');
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
        style={styles.section}
      >
        <SectionHeading title="닉네임" style={styles.sectionLabelSpacing} />
        
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
        style={[styles.section, { marginTop: Spacing.xxxl }]}
      >
        <SectionHeading title="디스플레이" style={styles.sectionLabelSpacing} />
        
        <View style={[styles.controlCardContainer, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <View style={styles.themeToggleRow}>
            <ThemeToggle />
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(240).duration(550).springify()}
        style={[styles.section, { marginTop: Spacing.xxxl }]}
      >
        <SectionHeading title="계정 제어" style={styles.sectionLabelSpacing} />
        
        <View style={[styles.controlCardContainer, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <Pressable 
            style={({ pressed }) => [
              styles.controlRow, 
              pressed && { backgroundColor: colors.background.glass }
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.controlText, { color: colors.text.primary }]}>로그아웃</Text>
          </Pressable>
          
          <View style={[styles.divider, { borderColor: colors.border.primary }]} />
          
          <Pressable 
            style={({ pressed }) => [
              styles.controlRow, 
              pressed && { backgroundColor: colors.background.glass }
            ]}
            onPress={handleWithdraw}
          >
            <Text style={[styles.controlText, { color: colors.state.danger }]}>회원 탈퇴</Text>
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
  section: {
    paddingHorizontal: Spacing.xxl,
  },
  sectionLabelSpacing: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderWidth: 0.61,
    borderRadius: Radii.lg,
  },
  nicknameText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
  controlCardContainer: {
    borderWidth: 0.61,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  controlRow: {
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
  },

  controlText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.md,
  },
  destructiveText: {
    color: '#FF4C4C',
  },
  divider: {
    height: 0,
    borderBottomWidth: 0.61,
    marginHorizontal: Spacing.xl,
  },
  versionContainer: {
    marginTop: Spacing.massive,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
  },
  themeToggleRow: {
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
  },
});
