import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import {
  useMatchingDesign,
  MatchingText as Text,
} from '@/src/features/match/components/MatchingDesign';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import type { MeetingRequestItem } from '@/src/types/api/meeting';
import { MatchActionButton } from './MatchActionButton';
import { MatchAvatar } from './MatchAvatar';

export function MeetingRequestDetail({
  request,
  busy,
  action,
  error,
  onClose,
  onAccept,
  onReject,
  onCall,
}: {
  request: MeetingRequestItem;
  busy: boolean;
  action: 'accept' | 'reject' | 'call' | null;
  error: string | null;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCall: () => void;
}) {
  const { colors, palette } = useMatchingDesign();
  const { height } = useWindowDimensions();
  const { contentContainerStyle } = useLayout();
  const insets = useSafeAreaInsets();
  const [confirmReject, setConfirmReject] = useState(false);
  const name = request.name || '상대방';
  const hasAnalysis =
    request.twinSimilarity != null ||
    !!request.conversationSummary ||
    request.summaryPoints.length > 0;
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <Modal
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={close}
    >
      <SafeAreaView edges={['left', 'right']} style={styles.overlay}>
        <Pressable
          onPress={close}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="신청 상세 닫기"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background.overlay },
          ]}
        />
        <View
          accessibilityViewIsModal
          style={[
            contentContainerStyle,
            styles.sheet,
            {
              maxHeight: height - insets.top - Spacing.lg,
              backgroundColor: colors.background.elevated,
            },
          ]}
        >
          <View
            accessible={false}
            style={[styles.handle, { backgroundColor: colors.border.strong }]}
          />
          <View style={styles.top}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text.primary }]}
            >
              받은 만남 신청
            </Text>
            <Pressable
              onPress={close}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="신청 상세 닫기"
              style={[styles.close, { backgroundColor: palette.tint }]}
            >
              <Feather name="x" size={22} color={colors.text.primary} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            ]}
          >
            <View style={styles.person}>
              <MatchAvatar
                name={name}
                url={request.profileImageUrl}
                size={64}
              />
              <View style={styles.personCopy}>
                <Text style={[styles.name, { color: colors.text.primary }]}>
                  {name}
                  {request.age != null ? ` · ${request.age}세` : ''}
                </Text>
                <Text style={[styles.copy, { color: colors.text.secondary }]}>
                  내 AI 트윈과 대화한 뒤 보낸 신청이에요.
                </Text>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                상대가 남긴 메시지
              </Text>
              <View
                style={[
                  styles.messageBubble,
                  { backgroundColor: palette.tint },
                ]}
              >
                <Text
                  selectable
                  style={[styles.message, { color: colors.text.primary }]}
                >
                  {request.message}
                </Text>
              </View>
            </View>
            {hasAnalysis && (
              <View
                style={[
                  styles.analysis,
                  {
                    borderColor: colors.border.primary,
                    backgroundColor: colors.background.primary,
                  },
                ]}
              >
                <Text style={[styles.label, { color: colors.text.primary }]}>
                  AI가 정리한 대화
                </Text>
                {request.twinSimilarity != null && (
                  <Text style={[styles.copy, { color: colors.brand.accent }]}>
                    대화 공감도 {request.twinSimilarity}%
                  </Text>
                )}
                {request.conversationSummary && (
                  <Text style={[styles.copy, { color: colors.text.secondary }]}>
                    {request.conversationSummary}
                  </Text>
                )}
                {request.summaryPoints.map((point, index) => (
                  <Text
                    key={index}
                    style={[styles.copy, { color: colors.text.secondary }]}
                  >
                    • {point}
                  </Text>
                ))}
                <Text style={[styles.note, { color: colors.text.secondary }]}>
                  내 트윈과 상대의 대화를 정리한 참고 정보예요.
                </Text>
              </View>
            )}
            <View style={styles.section}>
              {error && (
                <Text
                  accessibilityRole="alert"
                  style={[styles.copy, { color: colors.state.danger }]}
                >
                  {error}
                </Text>
              )}
              {confirmReject ? (
                <View
                  style={[
                    styles.analysis,
                    {
                      backgroundColor: colors.background.card,
                      borderColor: colors.border.primary,
                    },
                  ]}
                >
                  <Text style={[styles.label, { color: colors.text.primary }]}>
                    이 신청을 거절할까요?
                  </Text>
                  <Text style={[styles.copy, { color: colors.text.secondary }]}>
                    받은 신청 목록에서 사라져요. 차단하는 것은 아니에요.
                  </Text>
                  <MatchActionButton
                    label="신청 거절하기"
                    onPress={onReject}
                    danger
                    disabled={busy}
                    busy={busy && action === 'reject'}
                  />
                  <MatchActionButton
                    label="계속 살펴보기"
                    onPress={() => setConfirmReject(false)}
                    disabled={busy}
                  />
                </View>
              ) : (
                <>
                  <MatchActionButton
                    label="수락하고 대화하기"
                    onPress={onAccept}
                    primary
                    disabled={busy}
                    busy={busy && action === 'accept'}
                  />
                  <MatchActionButton
                    label="상대 트윈과 먼저 통화하기"
                    onPress={onCall}
                    disabled={busy}
                    busy={busy && action === 'call'}
                  />
                  <Text style={[styles.note, { color: colors.text.secondary }]}>
                    상대 본인이 아닌 AI 트윈과 통화해요. 연결된 시간만큼 보유
                    대화 시간이 사용돼요.
                  </Text>
                  <Pressable
                    onPress={() => setConfirmReject(true)}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityLabel="이 신청 거절"
                    style={styles.reject}
                  >
                    <Text
                      style={[styles.copy, { color: colors.text.secondary }]}
                    >
                      이 신청 거절
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    overflow: 'hidden',
    flexShrink: 1,
  },
  scroll: { flexGrow: 0 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  messageBubble: {
    padding: Spacing.lg,
    borderRadius: Radii.lg2,
    borderTopLeftRadius: Radii.bubble,
  },
  top: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    lineHeight: 28,
  },
  close: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  person: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  personCopy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  name: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.semibold,
    lineHeight: 34,
  },
  section: { gap: Spacing.sm },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 23,
  },
  message: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    lineHeight: 28,
  },
  copy: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 23,
  },
  note: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21 },
  analysis: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  reject: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
});
