import VerificationSuccessIcon from '@/assets/images/common/Verification_sucess.svg';
import FormLabel from '@/src/components/signup/common/FormLabel';
import {Radii, FontFamily, Colors} from '@/src/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step2';

interface NicknameSectionProps extends SectionProps {
  onCheck: () => void;
  isChecking: boolean;
}

/**
 * NicknameSection 컴포넌트 (SRP)
 * 닉네임 입력 필드와 중복 확인 버튼, 상태 피드백을 표시합니다.
 */
export default function NicknameSection({ state, onChange, onCheck, isChecking }: NicknameSectionProps) {
  return (
    <View style={styles.container}>
      <FormLabel label="닉네임" />

      <View style={styles.infoRow}>
        <TextInput
          style={styles.textInput}
          value={state.nickname}
          onChangeText={(text) => onChange({ nickname: text, isNicknameVerified: false })}
          placeholder="2자 이상 입력해주세요"
          placeholderTextColor="#6A7282"
          autoCapitalize="none"
          editable={!isChecking}
        />

        <TouchableOpacity
          style={styles.checkButton}
          onPress={onCheck}
          activeOpacity={0.8}
          disabled={isChecking || state.nickname.length < 2}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.checkButtonText}>중복 확인</Text>
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
    gap: 12, // Standard label-to-field gap
    alignSelf: 'stretch',
  },
  infoRow: {
    height: 49.202,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7.995,
    alignSelf: 'stretch',
  },
  textInput: {
    flex: 3,
    height: 49.202,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    color: '#FFF',
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.312,
  },
  checkButton: {
    flex: 1,
    height: 49.202,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.lg,
    backgroundColor: Colors.glass.white10,
  },
  checkButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 19.996,
    marginTop: -4, // Adjustment to bring feedback closer to input
  },
  infoContent: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  successText: {
    color: '#05DF72',
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});

