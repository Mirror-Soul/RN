import VerificationSuccessIcon from '@/assets/images/common/Verification_sucess.svg';
import FormLabel from '@/src/components/signup/common/FormLabel';
import {FontFamily, Colors, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step2';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface NicknameSectionProps extends SectionProps {
  onCheck: () => void;
  isChecking: boolean;
}

/**
 * NicknameSection 컴포넌트 (SRP)
 * 닉네임 입력 필드와 중복 확인 버튼, 상태 피드백을 표시합니다.
 */
export default function NicknameSection({ state, onChange, onCheck, isChecking }: NicknameSectionProps) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.container}>
      <FormLabel label="닉네임" />

      <View style={[styles.infoRow, { borderBottomColor: colors.border.primary }]}>
        <TextInput
          style={[styles.textInput, { color: colors.text.primary }]}
          value={state.nickname}
          onChangeText={(text) => onChange({ nickname: text, isNicknameVerified: false })}
          placeholder="2자 이상 입력해주세요"
          placeholderTextColor={colors.text.muted}
          autoCapitalize="none"
          editable={!isChecking}
        />

        <TouchableOpacity
          style={[
            styles.checkButton,
            { borderColor: (isChecking || state.nickname.length < 2) ? colors.border.primary : Colors.primary.electricCyan },
          ]}
          onPress={onCheck}
          activeOpacity={0.7}
          disabled={isChecking || state.nickname.length < 2}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color={Colors.primary.electricCyan} />
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.checkButtonText, (isChecking || state.nickname.length < 2) && { color: colors.text.muted }]}
            >
              중복 확인
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 닉네임 중복 확인 후 이상이 없을 경우 */}
      {state.isNicknameVerified && (
        <View style={styles.successContainer}>
          <VerificationSuccessIcon width={16} height={16} />
          <View style={styles.infoContent}>
            <Text style={styles.successText}>사용 가능한 닉네임입니다</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  textInput: {
    flex: 1,
    padding: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  checkButton: {
    flexShrink: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  checkButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary.electricCyan,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoContent: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  successText: {
    color: Colors.primary.successGreen,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
});

