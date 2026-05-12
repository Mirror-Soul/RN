import VerificationSuccessIcon from '@/assets/images/common/Verification_sucess.svg';
import VerifySendIcon from '@/assets/images/common/Verify_send.svg';
import FormLabel from '@/src/components/signup/common/FormLabel';
import StepSelectDropdown from '@/src/components/signup/common/StepSelectDropdown';
import { Colors, Radii } from '@/src/constants/theme';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import JobCategoryDropdown from '../Professional/JobCategoryDropdown';
import { SectionProps } from '../types/step2';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { jobCategories } from '../Professional/jobData';

interface JobVerificationSectionProps extends SectionProps {
  onVerify: (fileUri: string, contentType: string, fileName: string) => Promise<void>;
}

/**
 * JobVerificationSection 컴포넌트 (SRP)
 * 직군 선택 및 직업 인증(S3 업로드) 로직을 관리합니다.
 */
export default function JobVerificationSection({ state, onChange, onVerify }: JobVerificationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 파일 선택 및 업로드 핸들러 (C안: 갤러리/파일 + 카메라)
  const handlePickDocument = async () => {
    Alert.alert(
      '직업 인증',
      '인증 서류를 어떻게 업로드하시겠습니까?',
      [
        {
          text: '카메라로 촬영',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              await onVerify(
                asset.uri, 
                asset.mimeType || 'image/jpeg', 
                asset.fileName || `camera_${Date.now()}.jpg`
              );
            }
          }
        },
        {
          text: '파일/갤러리에서 선택',
          onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({
              type: ['image/*', 'application/pdf'],
              copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const asset = result.assets[0];
              await onVerify(
                asset.uri, 
                asset.mimeType || 'application/octet-stream', 
                asset.name
              );
            }
          }
        },
        { text: '취소', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <FormLabel label="직업" />

      <View style={styles.dropdownWrapper}>
        <StepSelectDropdown
          label="" 
          placeholder={jobCategories.find(j => j.value === state.jobCategory)?.label || "직군을 선택하세요"}
          onPress={() => setIsOpen(!isOpen)}
          isOpen={isOpen}
        />
        {isOpen && (
          <JobCategoryDropdown
            onSelect={(job) => {
              onChange({ 
                jobCategory: job,
                isJobVerified: false 
              });
              setIsOpen(false);
            }}
            onClose={() => setIsOpen(false)}
          />
        )}
      </View>

      <TextInput
        style={styles.jobTitleInput}
        value={state.jobTitle}
        onChangeText={(text) => onChange({ jobTitle: text })}
        placeholder="상세 직무를 입력해주세요 (선택 사항)"
        placeholderTextColor="#6A7282"
        autoCapitalize="none"
      />

      {/* Verification Card */}
      <View style={styles.verifyCard}>
        <View style={styles.verifyHeaderRow}>
          <View style={styles.verifyHeaderLeft}>
            <View style={styles.iconCircle}>
              {state.isJobVerifying ? (
                <ActivityIndicator size="small" color={Colors.primary.electricCyan} />
              ) : (
                <VerificationSuccessIcon width={24} height={24} />
              )}
            </View>
            <View style={styles.verifyTitleGroup}>
              <Text style={styles.verifyTitle}>
                {state.isJobVerified ? '인증 완료 ✓' : '선택 사항 (권장)'}
              </Text>
              <Text style={styles.verifySubtitle}>
                {state.isJobVerified
                  ? '직업 인증이 완료되었습니다.'
                  : '3배 더 많은 고품질 매칭을 보장합니다'}
              </Text>
            </View>
          </View>

          {!state.isJobVerified && (
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.verifyButton} 
              onPress={handlePickDocument}
              disabled={state.isJobVerifying}
            >
              {state.isJobVerifying ? (
                <ActivityIndicator size="small" color="#C27AFF" />
              ) : (
                <>
                  <VerifySendIcon width={16} height={16} />
                  <Text style={styles.verifyButtonText}>인증하기</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.verifyDescription}>
          {state.isJobVerified
            ? '신뢰도와 매칭 품질이 향상되었습니다.'
            : '재직증명서나 LinkedIn 프로필을 업로드하여 인증하세요. 인증된 프로필은 3배 더 많은 고품질 매칭을 받습니다.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    ...(Platform.OS === 'ios' ? { zIndex: 5 } : { elevation: 5 }),
  },
  containerOpen: {
    ...(Platform.OS === 'ios' ? { zIndex: 100 } : { elevation: 100 }),
  },
  dropdownWrapper: {
    position: 'relative',
    width: '100%',
  },
  jobTitleInput: {
    width: '100%',
    height: 49.202,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.312,
  },
  verifyCard: {
    width: '100%',
    marginTop: 10,
    padding: 16,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
    gap: 12,
  },
  verifyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  verifyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg2,
    backgroundColor: 'rgba(5, 223, 114, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyTitleGroup: {
    flexDirection: 'column',
  },
  verifyTitle: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  verifySubtitle: {
    color: '#99A1AF',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderRadius: Radii.md,
    borderWidth: 0.612,
    borderColor: 'rgba(194, 122, 255, 0.3)',
    backgroundColor: 'rgba(194, 122, 255, 0.1)',
  },
  verifyButtonText: {
    color: '#C27AFF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  verifyDescription: {
    color: '#99A1AF',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  }
});
