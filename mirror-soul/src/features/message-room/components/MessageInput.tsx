import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useMessageInput } from '../hooks/useMessageInput';

interface MessageInputProps {
  onSend: (text: string) => Promise<boolean>;
  isSending: boolean;
}

const MIN_INPUT_HEIGHT = 52;
const MAX_INPUT_HEIGHT = 132;
// ChatReqDTO.SendMessageDTO의 @Size(max = 2000)과 일치시킨다.
const MESSAGE_MAX_LENGTH = 2000;

/**
 * 실제 Chat API가 지원하는 TEXT 메시지에만 집중한 입력 영역.
 * 이미지·이모지처럼 서버에 없는 기능을 버튼으로 노출하지 않아, 눌렀을 때 막히는 경험을 없앤다.
 */
export default function MessageInput({ onSend, isSending }: MessageInputProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
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
    isSending: isInputSending,
  } = useMessageInput(onSend);

  const isPending = isSending || isInputSending;
  const isSendDisabled = text.trim().length === 0 || isPending;

  return (
    <Animated.View
      entering={FadeInUp.duration(280)}
      style={[
        styles.container,
        {
          backgroundColor: colors.background.elevated,
          borderTopColor: colors.border.primary,
          paddingBottom: Math.max(insets.bottom + Spacing.sm, Spacing.xl),
        },
      ]}
    >
      <View style={styles.inputRow}>
        <Animated.View
          style={[
            styles.inputWrapper,
            animatedContainerStyle,
            { backgroundColor: colors.background.glass },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text.primary }]}
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={colors.text.muted}
            multiline
            maxLength={MESSAGE_MAX_LENGTH}
            scrollEnabled
            blurOnSubmit={false}
            accessibilityLabel="메시지 입력"
          />
        </Animated.View>

        <Animated.View style={[styles.sendButtonWrapper, animatedSendStyle]}>
          <Pressable
            style={styles.sendButton}
            onPressIn={handleSendPressIn}
            onPressOut={handleSendPressOut}
            onPress={() => void handleSend()}
            disabled={isSendDisabled}
            accessibilityLabel="메시지 전송"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSendDisabled, busy: isPending }}
          >
            {isSendDisabled ? (
              <View style={[styles.sendInactive, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                {isPending ? (
                  <ActivityIndicator size="small" color={colors.text.muted} />
                ) : (
                  <Feather name="arrow-up" size={19} color={colors.text.muted} />
                )}
              </View>
            ) : (
              <LinearGradient
                colors={Colors.gradient.cyanToPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}
              >
                <Feather name="arrow-up" size={19} color={Colors.primary.soulBlack} />
              </LinearGradient>
            )}
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.text.muted }]}>텍스트 메시지만 전송할 수 있어요</Text>
        <Text style={[styles.footerText, { color: colors.text.muted }]}>{text.length}/{MESSAGE_MAX_LENGTH}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    minHeight: MIN_INPUT_HEIGHT,
    maxHeight: MAX_INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
  },
  input: {
    minHeight: MIN_INPUT_HEIGHT,
    maxHeight: MAX_INPUT_HEIGHT,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 15 : 12,
    paddingBottom: Platform.OS === 'ios' ? 15 : 12,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  sendButtonWrapper: {
    flexShrink: 0,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendInactive: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  footerText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
  },
});
