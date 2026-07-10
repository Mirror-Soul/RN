import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';

import { NicknameEditModal } from './components/NicknameEditModal';
import { useAccountStore } from '@/src/store/useAccountStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const AccountSettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nickname } = useAccountStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { 
    colors, 
    animatedBackground, 
    animatedCardBackground, 
    animatedGlassBackground,
    animatedBorder,
    animatedText, 
    animatedTextSecondary 
  } = useAnimatedTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => console.log('로그아웃 처리') },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('회원 탈퇴', '정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '탈퇴하기', style: 'destructive', onPress: () => console.log('탈퇴 처리') },
    ]);
  };

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <View style={styles.bgTopLeft} pointerEvents="none" />
      <View style={styles.bgBottomRight} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.delay(0).duration(500).springify()}
          style={styles.header}
        >
          <Pressable onPress={() => router.navigate('/(main)/profile')}>
            <Animated.View style={[styles.backButton, animatedGlassBackground, animatedBorder]}>
              <Feather name="arrow-left" size={20} color={colors.text.primary} />
            </Animated.View>
          </Pressable>
          <Animated.Text style={[styles.headerTitle, animatedText]}>계정 관리</Animated.Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={styles.sectionContainer}
        >
          <Animated.Text style={[styles.sectionLabel, animatedTextSecondary]}>닉네임</Animated.Text>
          
          <Animated.View style={[styles.cardContainer, animatedCardBackground]}>
            <Animated.Text style={[styles.nicknameText, animatedText]}>{nickname}</Animated.Text>
            
            <Pressable onPress={handleOpenModal} style={styles.editButton}>
              <Feather name="edit-2" size={14} color={colors.brand.accent} />
              <Text style={[styles.editButtonText, { color: colors.brand.accent }]}>수정</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(180).duration(550).springify()}
          style={[styles.sectionContainer, { marginTop: 32 }]}
        >
          <Animated.Text style={[styles.sectionLabel, animatedTextSecondary]}>디스플레이</Animated.Text>
          
          <Animated.View style={[styles.controlCardContainer, animatedCardBackground]}>
            <View style={styles.themeToggleRow}>
              <Animated.Text style={[styles.controlText, animatedText]}>다크 모드</Animated.Text>
              <Pressable 
                style={[styles.toggleButton, themeMode === 'dark' && { backgroundColor: colors.brand.accent }]}
                onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              >
                <View style={[styles.toggleThumb, themeMode === 'dark' ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(240).duration(550).springify()}
          style={[styles.sectionContainer, { marginTop: 32 }]}
        >
          <Animated.Text style={[styles.sectionLabel, animatedTextSecondary]}>계정 제어</Animated.Text>
          
          <Animated.View style={[styles.controlCardContainer, animatedCardBackground]}>
            <Pressable 
              style={({ pressed }) => [styles.controlRow, pressed && styles.controlRowPressed]}
              onPress={handleLogout}
            >
              <Animated.Text style={[styles.controlText, animatedText]}>로그아웃</Animated.Text>
            </Pressable>
            
            <Animated.View style={[styles.divider, animatedBorder]} />
            
            <Pressable 
              style={({ pressed }) => [styles.controlRow, pressed && styles.controlRowPressed]}
              onPress={handleWithdraw}
            >
              <Text style={[styles.controlText, styles.destructiveText]}>회원 탈퇴</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(360).duration(550).springify()}
          style={styles.versionContainer}
        >
          <Animated.Text style={[styles.versionText, animatedTextSecondary]}>현재 버전 {appVersion}</Animated.Text>
        </Animated.View>

      </ScrollView>

      <NicknameEditModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.61,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 18,
    letterSpacing: -0.44,
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
