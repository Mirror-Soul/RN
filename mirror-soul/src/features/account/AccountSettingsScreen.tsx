import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAccountStore } from '@/src/store/useAccountStore';
import { NicknameBottomSheet } from './components/NicknameBottomSheet';

export const AccountSettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nickname } = useAccountStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleOpenSheet = useCallback(() => setIsSheetOpen(true), []);
  const handleCloseSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <View style={styles.container}>
      {/* Radial Gradient 배경 레이어 (CSS 명세 재현) */}
      <View style={styles.bgTopLeft} pointerEvents="none" />
      <View style={styles.bgBottomRight} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Animated.View 
          entering={FadeInDown.delay(0).duration(500).springify()}
          style={styles.header}
        >
          <Pressable onPress={() => router.navigate('/(main)/profile')} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>계정 관리</Text>
          <View style={{ width: 40 }} /> {/* 타이틀 중앙 정렬용 여백 */}
        </Animated.View>

        {/* 닉네임 섹션 */}
        <Animated.View 
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={styles.sectionContainer}
        >
          <Text style={styles.sectionLabel}>닉네임</Text>
          
          <View style={styles.cardContainer}>
            <Text style={styles.nicknameText}>{nickname}</Text>
            
            <Pressable onPress={handleOpenSheet} style={styles.editButton}>
              <Feather name="edit-2" size={14} color="#00D3F2" />
              <Text style={styles.editButtonText}>수정</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* 연결된 계정 (MVP 제외로 주석 처리) */}
        {/*
        <Animated.View 
          entering={FadeInDown.delay(240).duration(550).springify()}
          style={[styles.sectionContainer, { marginTop: 24 }]}
        >
          <Text style={styles.sectionLabel}>연결된 계정</Text>
          <View style={styles.socialCardContainer}>
            <View style={styles.socialCardRow}>
              <Text style={styles.socialIcon}>🍏</Text>
              <View style={styles.socialTextContainer}>
                <Text style={styles.socialTitle}>Apple 연동됨</Text>
                <Text style={styles.socialEmail}>user@example.com</Text>
              </View>
            </View>
            <View style={styles.socialWarningContainer}>
              <Text style={styles.socialWarningText}>
                MVP에서는 계정 연동 변경이 지원되지 않습니다. 변경이 필요하시면 고객센터로 문의해 주세요.
              </Text>
            </View>
          </View>
        </Animated.View>
        */}

      </ScrollView>

      {/* 바텀 시트는 ScrollView 밖에서 렌더링해야 화면 전체를 덮을 수 있습니다 */}
      <NicknameBottomSheet isOpen={isSheetOpen} onClose={handleCloseSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 18,
    color: '#FFFFFF',
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
    color: '#6A7282',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  nicknameText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#FFFFFF',
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
    color: '#00D3F3',
  },
  // Social Card Styles
  socialCardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  socialCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.61,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialTextContainer: {
    flex: 1,
  },
  socialTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    letterSpacing: -0.15,
  },
  socialEmail: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    marginTop: 2,
  },
  socialWarningContainer: {
    padding: 12,
    paddingHorizontal: 20,
  },
  socialWarningText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 20,
    color: '#4A5565',
  },
});
