import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';

import { Header } from '@/src/components/common/Header';
import PartnerProfileModal from '@/src/components/home/main/Discovery/PartnerProfileModal';
import CallStartConfirmSheet, { CallTarget } from '@/src/components/call/CallStartConfirmSheet';
import { TimeRefillBottomSheet } from '@/src/features/profile/components/TimeRefillBottomSheet';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import MessageInput from './components/MessageInput';
import MessageRoomOptionsPanel from './components/MessageRoomOptionsPanel';
import { MessageRoomHeaderLeft } from './components/MessageRoomHeaderLeft';
import { MessageRoomHeaderRight } from './components/MessageRoomHeaderRight';
import { MessageListItemRenderer } from './components/MessageListItemRenderer';
import { ChatRoom, FlattenedListItem } from './types';
import type { Recommendation } from '@/src/types/api/home';
import { useMessageRoom } from './hooks/useMessageRoom';
import { useMessageRoomAnimations } from './hooks/useMessageRoomAnimations';
import { useMessageListFormatter } from './hooks/useMessageListFormatter';

interface MessageRoomScreenProps {
  room: ChatRoom;
}

/**
 * 실제 채팅 API를 중심으로 구성한 1:1 메시지 화면.
 * 빈 방도 "오류처럼 비어 보이지" 않도록 연결 완료 상태와 첫 대화 안내를 명시한다.
 */
export default function MessageRoomScreen({ room }: MessageRoomScreenProps) {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { contentContainerStyle } = useLayout();
  const [isCallSheetOpen, setIsCallSheetOpen] = useState(false);
  const [isRefillSheetOpen, setIsRefillSheetOpen] = useState(false);
  const [profileCandidate, setProfileCandidate] = useState<Recommendation | null>(null);
  const openCallAfterProfileDismissRef = useRef(false);

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
    isSending,
  } = useMessageRoom(room.chatRoomId);

  const flattenedData = useMessageListFormatter(dateGroups);
  const { glowLeftStyle, glowRightStyle } = useMessageRoomAnimations();
  const callTarget: CallTarget = { userUuid: room.partner.userUuid, name: room.partner.name };
  // 채팅방 API는 상대의 요약 정보만 내려준다. 상세 화면은 같은 UUID로
  // GET /home/recommendations/{target-user-uuid}를 호출해 최신 프로필을 받는다.
  const partnerProfileCandidate = useMemo<Recommendation>(
    () => ({
      userUuid: room.partner.userUuid,
      name: room.partner.name,
      age: room.partner.age,
      job: null,
      jobCertificationSubmitted: false,
      residence: null,
      selfIntroduction: null,
      mbti: null,
      personalityTags: [],
      profileImageUrl: room.partner.profileImageUrl,
      recommendationScore: 0,
    }),
    [room.partner]
  );
  const bubbleAvatarLetter = room.partner.name.charAt(0).toUpperCase();

  const handleStartCall = useCallback((target: CallTarget, isPreview: boolean, remainingSeconds?: number) => {
    setIsCallSheetOpen(false);
    // 시트의 닫힘 애니메이션을 끝낸 뒤 이동해 새 화면을 가리지 않게 한다.
    setTimeout(() => {
      router.push(
        isPreview
          ? { pathname: '/ai-call', params: { preview: 'true', targetName: target.name } }
          : {
              pathname: '/ai-call',
              params: {
                targetUuid: target.userUuid,
                targetName: target.name,
                remainingSeconds: String(remainingSeconds ?? 0),
              },
            },
      );
    }, 280);
  }, [router]);

  const handleRefillFromCall = useCallback(() => {
    setIsCallSheetOpen(false);
    setTimeout(() => setIsRefillSheetOpen(true), 280);
  }, []);

  const handleProfileDismiss = useCallback(() => {
    if (!openCallAfterProfileDismissRef.current) return;
    openCallAfterProfileDismissRef.current = false;
    setIsCallSheetOpen(true);
  }, []);

  const handleCallFromProfile = useCallback(() => {
    openCallAfterProfileDismissRef.current = true;
    setProfileCandidate(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FlattenedListItem>) => (
      <MessageListItemRenderer
        item={item}
        avatarLetter={bubbleAvatarLetter}
        avatarGradient={Colors.gradient.voiceStart}
      />
    ),
    [bubbleAvatarLetter]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.background} pointerEvents="none">
          <Animated.View
            style={[styles.glowLeft, glowLeftStyle, { backgroundColor: colors.glow.purple, shadowColor: colors.glow.purple }]}
          />
          <Animated.View
            style={[styles.glowRight, glowRightStyle, { backgroundColor: colors.glow.purple, shadowColor: colors.glow.purple }]}
          />
        </View>

        <Header
          leftContent={<MessageRoomHeaderLeft room={room} />}
          rightElement={
            <MessageRoomHeaderRight
              onOpenPanel={() => setIsPanelOpen(true)}
              onCallPress={() => setIsCallSheetOpen(true)}
            />
          }
          onBackPress={() => router.back()}
          backgroundColor={colors.background.elevated}
          delay={0}
        />

        <View style={[styles.messageList, contentContainerStyle]}>
          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={Colors.primary.vividPurple} />
              <Text style={[styles.centerStateText, { color: colors.text.secondary }]}>대화를 불러오는 중이에요</Text>
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <Feather name="message-circle" size={28} color={colors.text.muted} />
              <Text style={[styles.centerStateText, { color: colors.text.primary }]}>메시지를 불러오지 못했습니다</Text>
              <Pressable onPress={() => void refetch()} accessibilityRole="button" accessibilityLabel="메시지 다시 불러오기">
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : flattenedData.length === 0 ? (
            <ConversationEmptyState partnerName={room.partner.name} />
          ) : (
            <FlashList
              ref={scrollRef}
              data={flattenedData}
              renderItem={renderItem}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              getItemType={(item) => item.type}
              keyExtractor={(item) => item.id}
              // FlashList v2는 inverted를 지원하지 않는다. messages가 오래된 순서로
              // 정리돼 있으므로 하단에서 시작하고, 화면 상단에 닿을 때 더 과거 페이지를 가져온다.
              maintainVisibleContentPosition={{
                startRenderingFromBottom: true,
                autoscrollToBottomThreshold: 0.1,
                animateAutoScrollToBottom: true,
              }}
              onStartReached={() => {
                if (hasNextPage) void fetchNextPage();
              }}
              onStartReachedThreshold={0.4}
            />
          )}
        </View>

        <MessageInput onSend={handleSend} isSending={isSending} />
      </KeyboardAvoidingView>

      <MessageRoomOptionsPanel
        room={room}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onViewProfile={() => setProfileCandidate(partnerProfileCandidate)}
        onBlocked={() => {
          setIsPanelOpen(false);
          router.back();
        }}
      />

      <CallStartConfirmSheet
        target={callTarget}
        isOpen={isCallSheetOpen}
        onClose={() => setIsCallSheetOpen(false)}
        onStart={handleStartCall}
        onRefill={handleRefillFromCall}
      />
      <PartnerProfileModal
        match={profileCandidate}
        onClose={() => setProfileCandidate(null)}
        onDismiss={handleProfileDismiss}
        onConnectNow={handleCallFromProfile}
      />
      <TimeRefillBottomSheet isOpen={isRefillSheetOpen} onClose={() => setIsRefillSheetOpen(false)} />
    </View>
  );
}

function ConversationEmptyState({ partnerName }: { partnerName: string }) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.emptyState}>
      <LinearGradient colors={Colors.gradient.voiceStart} style={styles.emptyIcon}>
        <Feather name="message-circle" size={27} color={Colors.primary.soulBlack} />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>대화를 시작할 수 있어요</Text>
      <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
        {partnerName}님과 연결되었어요.{`\n`}가볍게 인사를 건네 보세요.
      </Text>
      <View style={[styles.emptyHint, { backgroundColor: colors.background.glass }]}>
        <Feather name="shield" size={14} color={Colors.primary.vividPurple} />
        <Text style={[styles.emptyHintText, { color: colors.text.muted }]}>불편한 대화는 우측 메뉴에서 신고하거나 차단할 수 있어요.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowLeft: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: Radii.full,
    top: 120,
    left: -110,
    opacity: 0.06,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 80,
    elevation: 0,
  },
  glowRight: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: Radii.full,
    bottom: 120,
    right: -140,
    opacity: 0.06,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 90,
    elevation: 0,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  centerStateText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.sm,
    color: Colors.primary.vividPurple,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingBottom: Spacing.massive,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: Spacing.xl,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xxl,
    letterSpacing: -0.45,
  },
  emptyDescription: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  emptyHintText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 17,
  },
});
