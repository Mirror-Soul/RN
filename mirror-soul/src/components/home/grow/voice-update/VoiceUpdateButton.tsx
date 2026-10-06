import { Feather } from '@expo/vector-icons';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import GrowDoneActionRow from '@/src/components/home/grow/GrowDoneActionRow';
import VoiceUpdateIdleStatus, {
  VoiceUpdateIdleStatusVariant,
} from '@/src/components/home/grow/voice-update/VoiceUpdateIdleStatus';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatVoiceCooldown } from './readingSimilarity';

export type VoiceUpdateStatus = 'idle' | 'starting' | 'recording' | 'analyzing' | 'done';

interface VoiceUpdateButtonProps {
  status: VoiceUpdateStatus;
  elapsedTime?: string;
  onPress: () => void;
  onRetry: () => void;
  recordingBlocked?: boolean;
  /** 2분 쿨다운이 남았으면 남은 초. 제출 완료 후 다음 문장 버튼에도 표시한다. */
  cooldownRemainingSeconds?: number;
  /** 쿨다운 여부를 확인하는 중(twinSync 최초 조회)이면 true — 곧 풀리는 상태라 안내만 한다. */
  isCooldownStatusPending?: boolean;
  /** 쿨다운 조회 자체가 실패했으면 true — pending과 달리 저절로 안 풀리므로 재시도 UI가 필요하다. */
  isCooldownStatusError?: boolean;
  /** 쿨다운 조회 재시도가 진행 중이면 true(에러 상태에서 "다시 확인"을 탭한 직후). */
  isCooldownCheckRetrying?: boolean;
  /** 쿨다운 조회 재시도. isCooldownStatusError일 때만 호출된다. */
  onRetryCooldownCheck?: () => void;
}

/**
 * 목소리 업데이트 버튼 (SRP)
 */
export default function VoiceUpdateButton({
  status,
  elapsedTime,
  onPress,
  onRetry,
  recordingBlocked = false,
  cooldownRemainingSeconds,
  isCooldownStatusPending,
  isCooldownStatusError,
  isCooldownCheckRetrying,
  onRetryCooldownCheck,
}: VoiceUpdateButtonProps) {
  const { width } = useWindowDimensions();
  const { colors } = useThemeColors();

  // Keep the recording control reachable without taking space away from the reading prompt.
  const dynamicButtonSize = status === 'done' ? 48 : Math.max(64, Math.min(width * 0.19, 80));

  const isIdle = status === 'idle';
  const isStarting = status === 'starting';
  const isRecording = status === 'recording';
  const isAnalyzing = status === 'analyzing';
  const isDone = status === 'done';
  // 쿨다운 여부를 아직 모르는 동안(twinSync 로딩/에러)엔 "쿨다운 아님"으로 단정하지 않고
  // 마찬가지로 막는다 — 확인 안 된 걸 확인됨으로 취급하면 쿨다운 중에도 녹음이 가능해진다.
  // pending(로딩)과 error(조회 실패)는 서로 다르게 보여준다 — pending은 곧 풀리지만 error는
  // 사용자가 직접 재시도해야 풀리므로, error만 별도로 재시도 UI를 갖는다. 배타조건 판별은
  // 여기 한 곳에서만 하고, VoiceUpdateIdleStatus는 결과 variant만 받아 표시에만 집중한다.
  const idleStatus: VoiceUpdateIdleStatusVariant =
    !!cooldownRemainingSeconds && cooldownRemainingSeconds > 0
      ? 'cooldown'
      : isCooldownStatusError
        ? 'checkFailed'
        : isCooldownStatusPending
          ? 'checking'
          : 'ready';
  const isCoolingDown = isIdle && idleStatus !== 'ready';
  const disabled = isStarting || isAnalyzing || isCoolingDown || (isIdle && recordingBlocked);

  // 상태별 그라디언트 및 그림자 스타일 결정
  const gradientColors = isIdle || isStarting
    ? Colors.gradient.voiceStart
    : isRecording
      ? Colors.gradient.recording
      : Colors.gradient.done; // analyzing과 done 모두 초록색 사용

  const shadowStyle = isIdle || isStarting
    ? Colors.shadow.voiceStart
    : isRecording
      ? Colors.shadow.recording
      : Colors.shadow.done;

  return (
    <View style={styles.container}>
      <View style={styles.controlRow}>
      {status === 'done' ? (
        // 완료 상태: 클릭 불가능한 정적 뷰로 유지
        <View 
          style={[
            styles.buttonWrapper, 
            shadowStyle, 
            { width: dynamicButtonSize, height: dynamicButtonSize }
          ]}
        >
          <LinearGradient
            colors={Colors.gradient.done}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Feather name="check" size={32} color={Colors.neutral.pureWhite} />
          </LinearGradient>
        </View>
      ) : (
        // 그 외 상태: 인터랙션 가능한 버튼
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isRecording ? '녹음 종료 후 문장 확인' : isStarting ? '녹음 준비 중' : isAnalyzing ? '녹음 전송 중' : '목소리 녹음 시작'}
          accessibilityState={{ disabled, busy: isStarting || isAnalyzing }}
          activeOpacity={0.8}
          onPress={onPress}
          style={[
            styles.buttonWrapper,
            shadowStyle,
            { width: dynamicButtonSize, height: dynamicButtonSize }, // 동적 사이즈 적용
            disabled && styles.buttonCoolingDown,
          ]}
          disabled={disabled}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            {(isIdle || isStarting) && <Feather name="mic" size={32} color={Colors.neutral.pureWhite} />}
            {isRecording && <Feather name="square" size={32} color={Colors.neutral.pureWhite} />}
            {isAnalyzing && <Feather name="upload-cloud" size={32} color={Colors.neutral.pureWhite} />}
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.infoArea}>
        {isStarting && <Text style={[styles.statusText, { color: colors.text.secondary }]}>녹음을 준비하고 있어요…</Text>}
        {isIdle && recordingBlocked && <Text style={[styles.statusText, { color: colors.text.secondary }]}>읽을 문장을 확인해주세요</Text>}
        {isIdle && !recordingBlocked && (
          <VoiceUpdateIdleStatus
            status={idleStatus}
            cooldownRemainingSeconds={cooldownRemainingSeconds}
            isRetrying={isCooldownCheckRetrying}
            onRetryCooldownCheck={onRetryCooldownCheck}
          />
        )}

        {isRecording && (
          <View style={styles.recordingInfo}>
            <View style={styles.recordingStatusRow}>
              <View style={styles.recordingDot} />
              <Text style={[styles.statusText, { color: colors.text.primary }]}>녹음 중</Text>
              <Text style={[styles.elapsedText, { color: colors.text.secondary }]}>{elapsedTime ?? '00:00'}</Text>
            </View>
            <Text style={[styles.statusText, { color: colors.text.primary }]}>끝내고 확인하기</Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.doneInfo}>
            <Text style={[styles.statusText, { color: Colors.primary.successGreen, fontWeight: FontWeight.semibold }]}>
              녹음을 보내고 있어요…
            </Text>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>녹음 전송이 끝나면 학습을 요청해요. 잠시만 기다려 주세요.</Text>
          </View>
        )}

        {isDone && (
          <View style={styles.doneInfo}>
            <Text style={[styles.statusText, { color: colors.text.primary }]}>녹음을 보냈어요</Text>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>학습을 요청했어요. 반영까지 시간이 걸릴 수 있어요.</Text>
          </View>
        )}
      </View>
      </View>
      {isDone && <View style={styles.finalActionArea}>
        {(idleStatus === 'checkFailed' || idleStatus === 'checking') && <VoiceUpdateIdleStatus status={idleStatus} isRetrying={isCooldownCheckRetrying} onRetryCooldownCheck={onRetryCooldownCheck} />}
        <GrowDoneActionRow retryLabel="다음 문장 읽기" onRetry={onRetry} retryDisabled={idleStatus !== 'ready'}
          retryHint={idleStatus === 'cooldown' ? `${formatVoiceCooldown(cooldownRemainingSeconds ?? 0)} 후 가능` : undefined} completeLabel="성장으로 돌아가기" />
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: 12,
    alignSelf: 'stretch',
  },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  buttonWrapper: {
    // width와 height는 컴포넌트 내부에서 동적으로 할당됨
    borderRadius: Radii.full,
    flexShrink: 0,
  },
  buttonCoolingDown: {
    opacity: 0.5,
  },
  button: {
    flex: 1,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoArea: {
    flex: 1,
    minWidth: 0,
    alignItems: 'stretch',
  },
  recordingInfo: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  recordingStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.recordingRed,
    opacity: 0.8,
  },
  doneInfo: {
    alignSelf: 'stretch',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  statusText: {
    alignSelf: 'stretch',
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  elapsedText: {
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  footerText: {
    alignSelf: 'stretch',
    textAlign: 'left',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 21,
  },
  finalActionArea: {
    width: '100%',
    alignItems: 'stretch',
    gap: 10,
  },
});
