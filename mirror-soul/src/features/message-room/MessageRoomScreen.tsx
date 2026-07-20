import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Header } from '@/src/components/common/Header';
import MessageBubble from './components/MessageBubble';
import MessageDateDivider from './components/MessageDateDivider';
import MessageInput from './components/MessageInput';
import MessageRoomOptionsPanel from './components/MessageRoomOptionsPanel';
import { ChatRoom } from './types';
import { useMessageRoom } from './hooks/useMessageRoom';
import { useMessageRoomAnimations } from './hooks/useMessageRoomAnimations';
import { MessageRoomHeaderLeft } from './components/MessageRoomHeaderLeft';
import { MessageRoomHeaderRight } from './components/MessageRoomHeaderRight';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

interface MessageRoomScreenProps {
  room: ChatRoom;
}

/**
 * 메시지방 상세 스크린
 *
 * 구성:
 * - Header (common/Header 재사용 — leftContent로 아바타+이름 영역 커스터마이징)
 * - 배경 글로우 효과 (애니메이션)
 * - 메시지 목록 (날짜 구분 + 말풍선 stagger 애니메이션)
 * - MessageInput 푸터
 */
export default function MessageRoomScreen({ room }: MessageRoomScreenProps) {
  const router = useRouter();

  const {
    dateGroups,
    handleSend,
    scrollRef,
    isPanelOpen,
    setIsPanelOpen,
  } = useMessageRoom(room.dateGroups);

  const { glowLeftStyle, glowRightStyle } = useMessageRoomAnimations();

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── 배경 ── */}
        <View style={styles.background}>
          <Animated.View pointerEvents="none" style={[styles.glowLeft, glowLeftStyle]} />
          <Animated.View pointerEvents="none" style={[styles.glowRight, glowRightStyle]} />
        </View>

        {/* ── 헤더 ── */}
        <Header
          leftContent={<MessageRoomHeaderLeft room={room} />}
          rightElement={<MessageRoomHeaderRight onOpenPanel={() => setIsPanelOpen(true)} />}
          onBackPress={() => router.back()}
          backgroundColor="rgba(0, 0, 0, 0.6)"
          borderBottomColor={Colors.glass.white05}
          delay={0}
        />

        {/* ── 메시지 목록 ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {dateGroups.map((group, groupIdx) => {
            let msgOffset = 0;
            dateGroups.slice(0, groupIdx).forEach((g) => {
              msgOffset += g.messages.length;
            });

            return (
              <Animated.View key={group.date} entering={FadeIn.duration(300)}>
                <MessageDateDivider label={group.date} />
                {group.messages.map((msg, msgIdx) => {
                  const globalIdx = msgOffset + msgIdx;
                  const isReceived = msg.direction === 'RECEIVED';
                  const prevMsg = group.messages[msgIdx - 1];
                  const hideAvatar =
                    isReceived && !!prevMsg && prevMsg.direction === 'RECEIVED';

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      avatarLetter={room.avatarLetter}
                      avatarGradient={room.avatarGradient}
                      enterDelay={globalIdx * 60}
                      hideAvatar={hideAvatar}
                    />
                  );
                })}
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* ── 입력 푸터 ── */}
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>

      {/* ── 옵션 패널 (absolute, KAV 위에 올림) ── */}
      <MessageRoomOptionsPanel
        room={room}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  /* 배경 글로우 */
  glowLeft: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0, 184, 219, 1)',
    top: 0,
    left: '25%',
    // React Native에서 CSS filter:blur 대체: shadowRadius 활용
    shadowColor: 'rgba(0, 184, 219, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 0,
  },
  glowRight: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(173, 70, 255, 1)',
    bottom: 200,
    right: '15%',
    shadowColor: 'rgba(173, 70, 255, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 0,
  },

  /* ── 메시지 목록 ── */
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
});
