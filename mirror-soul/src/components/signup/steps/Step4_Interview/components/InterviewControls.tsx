import ContinueIcon from '@/assets/images/common/Continue_icon.svg';
import VoiceIcon from '@/assets/images/common/Voice_icon.svg';
import VoiceIconWhite from '@/assets/images/common/Voice_icon_white.svg';
import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  isRecording?: boolean;
  isLastQuestion?: boolean;
  isNextDisabled?: boolean; // 추가: 업로드 중 등 비활성화 상태 제어
  onRecordPress: () => void;
  onNextPress: () => void;
}

export default function InterviewControls({ 
  isRecording = false, 
  isLastQuestion = false, 
  isNextDisabled = false,
  onRecordPress, 
  onNextPress 
}: Props) {
  return (
    <View style={styles.container}>
      {/* 1. 녹음 버튼 (상태에 따라 스타일 변화) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRecordPress}
        style={[
          styles.recordButtonWrapper,
          isRecording && styles.recordingButtonActive
        ]}
      >
        {isRecording ? (
          <View style={styles.recordingContent}>
            <VoiceIconWhite width={24.821} height={24.821} />
            <Text style={styles.recordingText}>녹음 중지</Text>
          </View>
        ) : (
          <LinearGradient
            colors={Colors.gradient.cyanBluePurple}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.recordGradient}
          >
            <VoiceIcon width={24} height={24} />
            <Text style={styles.recordText}>녹음 시작</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* 2. 다음/완료 버튼 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNextPress}
        disabled={isNextDisabled}
        style={[styles.nextButton, isNextDisabled && { opacity: 0.5 }]}
      >
        <Text style={styles.nextText}>{isLastQuestion ? '완료' : '다음'}</Text>
        <ContinueIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    height: 72,
  },
  recordButtonWrapper: {
    flex: 1,
    height: '100%',
    borderRadius: Radii.lg,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.30,
    shadowRadius: 50,
    elevation: 10,
  },
  recordingButtonActive: {
    backgroundColor: Colors.primary.recordingRed,
    shadowColor: Colors.primary.recordingRed,
    // 유저 요청: box-shadow: 0 25px 50px -12px rgba(251, 44, 54, 0.30);
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.30,
    shadowRadius: 50,
  },
  recordGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.xl,
  },
  recordingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 11.582,
    borderRadius: Radii.lg,
  },
  recordText: {
    color: Colors.primary.soulBlack,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  recordingText: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  nextButton: {
    width: 142.796,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.lg,
    borderWidth: 1.836,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  nextText: {
    color: Colors.neutral.disabledText,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});

