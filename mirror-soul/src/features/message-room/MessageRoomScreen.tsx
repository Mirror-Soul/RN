import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';

import { Header } from '@/src/components/common/Header';
import MessageInput from './components/MessageInput';
import MessageRoomOptionsPanel from './components/MessageRoomOptionsPanel';
import { ChatRoom, FlattenedListItem } from './types';
import { useMessageRoom } from './hooks/useMessageRoom';
import { useMessageRoomAnimations } from './hooks/useMessageRoomAnimations';
import { useMessageListFormatter } from './hooks/useMessageListFormatter';
import { MessageRoomHeaderLeft } from './components/MessageRoomHeaderLeft';
import { MessageRoomHeaderRight } from './components/MessageRoomHeaderRight';
import { MessageListItemRenderer } from './components/MessageListItemRenderer';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';

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
  const { contentContainerStyle } = useLayout();

  const {
    dateGroups,
    handleSend,
    scrollRef,
    isPanelOpen,
    setIsPanelOpen,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useMessageRoom(room.chatRoomId);

  const flattenedData = useMessageListFormatter(dateGroups);
  const { glowLeftStyle, glowRightStyle } = useMessageRoomAnimations();

  // 말풍선 아바타는 실제 사진 대신 이니셜+고정 그라디언트를 쓴다(작은 반복 요소라 헤더/옵션
  // 패널의 실사진 아바타와 달리 굳이 이미지 로딩을 안 태운다) — 백엔드에 room.avatarLetter 같은
  // 개념 자체가 없으므로 partner.name에서 직접 파생한다.
  const bubbleAvatarLetter = room.partner.name.charAt(0).toUpperCase();

  // FlashList 렌더링 콜백 함수
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FlattenedListItem>) => {
      return (
        <MessageListItemRenderer
          item={item}
          avatarLetter={bubbleAvatarLetter}
          avatarGradient={Colors.gradient.avatarPlaceholder}
        />
      );
    },
    [bubbleAvatarLetter]
  );

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
          rightElement={
            <MessageRoomHeaderRight
              onOpenPanel={() => setIsPanelOpen(true)}
              onCallPress={() =>
                router.push({ pathname: '/ai-call', params: { targetUuid: room.partner.userUuid } })
              }
            />
          }
          onBackPress={() => router.back()}
          backgroundColor="rgba(0, 0, 0, 0.6)"
          borderBottomColor={Colors.glass.white05}
          delay={0}
        />

        {/* ── 메시지 목록 ── */}
        <View style={[styles.messageList, contentContainerStyle]}>
          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={Colors.primary.electricCyan} />
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <Text style={styles.centerStateText}>메시지를 불러오지 못했습니다</Text>
              <Pressable onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="다시 시도">
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : (
            // @ts-ignore: estimatedItemSize is valid but types might be outdated
            <FlashList
              ref={scrollRef}
              data={flattenedData}
              renderItem={renderItem}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={70}
              getItemType={(item) => item.type}
              inverted={true} // 최신 메시지가 화면 최하단(배열 맨앞)에 렌더링되도록 역순 정렬
              keyExtractor={(item) => item.id}
              // inverted 리스트라 "끝에 도달"이 화면상으로는 위로 스크롤해서 과거 메시지에 닿은 것 — 다음(더 과거) 페이지 요청
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.4}
            />
          )}
        </View>

        {/* ── 입력 푸터 ── */}
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>

      {/* ── 옵션 패널 (absolute, KAV 위에 올림) ── */}
      <MessageRoomOptionsPanel
        room={room}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onBlocked={() => {
          setIsPanelOpen(false);
          router.back();
        }}
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
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  centerStateText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    color: Colors.neutral.lightGray,
  },
  retryText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    color: Colors.primary.electricCyan,
  },
});
