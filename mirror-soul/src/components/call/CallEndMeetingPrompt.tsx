import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useCreateMeetingRequestMutation } from '@/src/features/match/hooks/useCreateMeetingRequestMutation';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { CompletedCall } from '@/src/hooks/useAICallFlow';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { formatCallTime, formatDurationLabel } from '@/src/utils/formatCallTime';
import CallScreenBackground from './CallScreenBackground';

interface CallEndMeetingPromptProps {
  partnerName: string;
  partnerUserUuid: string;
  completedCall: CompletedCall;
  endedByTimeLimit: boolean;
  onClose: () => void;
}

/**
 * 상대 트윈과의 통화가 서버에서 정상 종료된 경우에만 보여주는 후속 화면.
 * 채팅방을 먼저 열지 않고, 만남 신청을 보낸 뒤 상대방의 수락 API가 채팅방을 만드는
 * 백엔드 도메인 규칙을 그대로 따르므로 실제 사용자 간 대화 권한이 앞당겨지지 않는다.
 */
export default function CallEndMeetingPrompt({
  partnerName,
  partnerUserUuid,
  completedCall,
  endedByTimeLimit,
  onClose,
}: CallEndMeetingPromptProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const createRequest = useCreateMeetingRequestMutation();
  const [message, setMessage] = useState(
    `${partnerName}님, 트윈과 이야기해 보니 더 알아가고 싶어요. 괜찮다면 메시지로 대화해요!`,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const trimmedMessage = message.trim();

  const handleSend = async () => {
    if (!trimmedMessage || createRequest.isPending) return;

    setErrorMessage(null);
    try {
      await createRequest.mutateAsync({
        receiverUserUuid: partnerUserUuid,
        videoCallId: completedCall.callId,
        message: trimmedMessage,
      });
      setIsSent(true);
    } catch (error) {
      setErrorMessage(getErrorDisplayMessage(error, '만남 신청을 보내지 못했어요. 잠시 후 다시 시도해주세요.'));
    }
  };

  if (isSent) {
    return (
      <CallScreenBackground>
        <View style={[styles.successContainer, { paddingTop: insets.top + Spacing.massive, paddingBottom: insets.bottom + Spacing.xxxl }]}>
          <View style={styles.successBadge}>
            <Feather name="send" size={36} color={Colors.primary.electricCyan} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>만남 신청을 보냈어요</Text>
          <Text style={[styles.successCopy, { color: colors.text.secondary }]}>상대가 수락하면 두 분의 메시지방이 자동으로 열려요.</Text>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border.primary, backgroundColor: colors.background.glass }]}
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="발견 화면으로 돌아가기"
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>발견으로 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </CallScreenBackground>
    );
  }

  return (
    <CallScreenBackground>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xxl }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topSection}>
          <View style={styles.iconBadge}>
            <Feather name="heart" size={25} color={Colors.primary.electricCyan} />
          </View>
          <Text style={[styles.eyebrow, { color: Colors.primary.electricCyan }]}>TWIN CALL COMPLETE</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>대화는 어떠셨나요?</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            {endedByTimeLimit
              ? '남은 대화 시간을 모두 사용해 통화가 자동으로 종료됐어요.'
              : `${partnerName}님의 AI 트윈과 나눈 대화가 종료됐어요.`}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.text.muted }]}>함께 대화한 시간</Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>{formatDurationLabel(completedCall.durationSec)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={[styles.summaryLabel, { color: colors.text.muted }]}>남은 대화 시간</Text>
            <Text style={[styles.summaryValue, { color: colors.text.primary }]}>{formatCallTime(completedCall.remainingTalkTime)}</Text>
          </View>
        </View>

        <View style={styles.requestSection}>
          <Text style={[styles.requestTitle, { color: colors.text.primary }]}>{partnerName}님에게 만남을 신청할까요?</Text>
          <Text style={[styles.requestDescription, { color: colors.text.muted }]}>전할 메시지를 남기면 상대의 만남 신청 탭에 전달돼요.</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            maxLength={1000}
            multiline
            textAlignVertical="top"
            placeholder="상대에게 전할 메시지를 작성해주세요."
            placeholderTextColor={colors.text.muted}
            style={[styles.messageInput, { color: colors.text.primary, backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
            accessibilityLabel="만남 신청 메시지"
          />
          <Text style={[styles.characterCount, { color: colors.text.muted }]}>{message.length} / 1000</Text>
          {errorMessage ? <Text style={[styles.errorText, { color: colors.state.danger }]}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!trimmedMessage || createRequest.isPending}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="만남 신청 보내기"
            accessibilityState={{ disabled: !trimmedMessage || createRequest.isPending, busy: createRequest.isPending }}
            style={[styles.primaryButtonWrapper, (!trimmedMessage || createRequest.isPending) && styles.primaryButtonDisabled]}
          >
            <LinearGradient colors={Colors.gradient.cyanToPurple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
              {createRequest.isPending ? <ActivityIndicator color={Colors.neutral.pureWhite} /> : <Feather name="send" size={18} color={Colors.neutral.pureWhite} />}
              <Text style={styles.primaryButtonText}>만남 신청 보내기</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} disabled={createRequest.isPending} style={styles.laterButton} accessibilityRole="button" accessibilityLabel="나중에 하기">
            <Text style={[styles.laterButtonText, { color: colors.text.muted }]}>나중에 할게요</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </CallScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  topSection: {
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan30_d3,
  },
  eyebrow: {
    marginTop: Spacing.lg,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.4,
  },
  title: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.7,
  },
  description: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.xxl,
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.lg,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.glass.white20,
  },
  summaryLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  summaryValue: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.mono,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    textAlign: 'center',
  },
  requestSection: {
    flex: 1,
    marginTop: Spacing.xxxl,
  },
  requestTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  requestDescription: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  messageInput: {
    minHeight: 112,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
  },
  characterCount: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'right',
  },
  errorText: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryButtonWrapper: {
    overflow: 'hidden',
    borderRadius: Radii.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: Colors.neutral.pureWhite,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  laterButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  successBadge: {
    width: 84,
    height: 84,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan30_d3,
  },
  successCopy: {
    marginTop: Spacing.md,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 54,
    marginTop: Spacing.massive,
    borderRadius: Radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
});
