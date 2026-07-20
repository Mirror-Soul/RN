import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useMessageInput } from '../hooks/useMessageInput';


interface MessageInputProps {
  onSend: (text: string) => void;
}

const MIN_INPUT_HEIGHT = 48;
const MAX_INPUT_HEIGHT = 128;

/**
 * 메시지 입력 푸터
 *
 * ── 버그 수정 이력 ──
 * 이전: onContentSizeChange 콜백에서 height 상태를 직접 업데이트 →
 *   contentSize가 바뀔 때마다 height가 바뀌고, height가 바뀌면 contentSize가 다시
 *   바뀌는 피드백 루프 발생 → 입력창 "마구잡이 점프" 현상
 *
 * 수정: height 상태 제거. multiline TextInput에 minHeight/maxHeight만 지정하면
 *   React Native가 내부적으로 높이를 안정적으로 관리합니다.
 *   maxHeight 초과 시 scrollEnabled로 스크롤 처리.
 */
export default function MessageInput({ onSend }: MessageInputProps) {
  const insets = useSafeAreaInsets();
  const {
    text,
    setText,
    inputRef,
    handleFocus,
    handleBlur,
    handleSendPressIn,
    handleSendPressOut,
    handleSend,
    animatedContainerStyle,
    animatedSendStyle,
  } = useMessageInput(onSend);

  // 전송 버튼 비활성화 여부
  const isSendDisabled = text.trim().length === 0;

  return (
    <Animated.View
      entering={FadeInUp.duration(350).springify()}
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom + Spacing.md, Spacing.xxl) },
      ]}
    >
      {/* ── 입력 행 ── */}
      <View style={styles.inputRow}>
        {/* 이미지 첨부 버튼 */}
        <Pressable
          style={styles.iconButton}
          accessibilityLabel="이미지 첨부"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="image" size={20} color={Colors.neutral.darkGray} />
        </Pressable>

        {/* TextInput 래퍼 — 높이는 min/max로만 제어, 직접 height 설정 금지 */}
        <Animated.View style={[styles.inputWrapper, animatedContainerStyle]}>
          {/* 첨부 아이콘 내부 좌측 */}
          <View style={styles.inputIconLeft} pointerEvents="none">
            <Feather name="paperclip" size={16} color={Colors.neutral.darkGray} />
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            multiline
            // scrollEnabled가 true여야 maxHeight 에서 내부 스크롤 처리
            scrollEnabled
            // blurOnSubmit=false: Enter 키로 전송하지 않고 줄바꿈
            blurOnSubmit={false}
          />

          {/* 이모지 버튼 내부 우측 — absolute 제거하고 View로 포지셔닝 */}
          <View style={styles.inputIconRight} pointerEvents="box-none">
            <Pressable
              accessibilityLabel="이모지"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="happy-outline" size={20} color={Colors.neutral.darkGray} />
            </Pressable>
          </View>
        </Animated.View>

        {/* 전송 버튼 */}
        <Animated.View style={[styles.sendButtonWrapper, animatedSendStyle]}>
          <Pressable
            style={styles.sendButton}
            onPressIn={handleSendPressIn}
            onPressOut={handleSendPressOut}
            onPress={handleSend}
            disabled={isSendDisabled}
            accessibilityLabel="메시지 전송"
            accessibilityRole="button"
          >
            {!isSendDisabled ? (
              <LinearGradient
                colors={Colors.gradient.twinCallButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}
              >
                <Feather name="send" size={18} color={Colors.primary.soulBlack} />
              </LinearGradient>
            ) : (
              <View style={styles.sendInactive}>
                <Feather name="send" size={18} color={Colors.neutral.disabledText} />
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>

      {/* ── 유사도 안내 배지 ── */}
      <View style={styles.hintRow}>
        <View style={styles.hintBadge}>
          <Ionicons name="flash-outline" size={12} color={Colors.primary.electricCyan} />
          <Text style={styles.hintText}>유사도가 높아 대화가 잘 통할 확률이 높아요</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderTopColor: Colors.glass.white05,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',  // 여러 줄일 때 아이콘들이 하단 정렬
    gap: Spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  /* ─ TextInput 래퍼 ─
   * height 고정 없이 minHeight/maxHeight로만 제어.
   * flex: 1로 가로 공간 채우기.
   * flexDirection: 'row'로 아이콘과 input을 나란히 배치.
   */
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.glass.white05,
    borderWidth: 1,
    borderRadius: Radii.lg,
    minHeight: MIN_INPUT_HEIGHT,
    maxHeight: MAX_INPUT_HEIGHT,
    overflow: 'hidden',
  },
  inputIconLeft: {
    paddingLeft: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: Colors.neutral.pureWhite,
    paddingHorizontal: Spacing.sm,
    paddingTop: Platform.OS === 'ios' ? 14 : 12,
    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    // textAlignVertical: 'top'으로 iOS와 Android 모두 상단 정렬
    textAlignVertical: 'top',
    // height를 직접 지정하지 않음 → 부모 minHeight/maxHeight에 위임
  },
  inputIconRight: {
    paddingRight: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    justifyContent: 'flex-end',
    flexShrink: 0,
  },

  /* ─ 전송 버튼 ─ */
  sendButtonWrapper: {
    flexShrink: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendInactive: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glass.white05,
    borderWidth: 1,
    borderColor: Colors.glass.white05,
  },

  /* ─ 유사도 안내 배지 ─ */
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0, 211, 243, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 211, 243, 0.1)',
    borderRadius: Radii.full,
  },
  hintText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 0.12,
    color: 'rgba(0, 211, 243, 0.8)',
  },
});
