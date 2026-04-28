import CancelIcon from '@/assets/images/common/Cancel.svg';
import CompleteIcon from '@/assets/images/common/Complete.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';

interface ChatEditFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * 통화 메시지 수정 폼 (SRP)
 * 내 말풍선(SENT)의 편집 버튼 탭 시 표시됩니다.
 */
export default function ChatEditForm({
  value,
  onChangeText,
  onSave,
  onCancel,
}: ChatEditFormProps) {
  return (
    <View style={styles.container}>
      {/* TextArea */}
      <TextInput
        style={styles.textArea}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        placeholderTextColor={Colors.neutral.darkGray}
      />

      {/* 버튼 영역 */}
      <View style={styles.buttonRow}>
        {/* 저장 버튼 */}
        <TouchableOpacity
          style={styles.saveButtonWrapper}
          onPress={onSave}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="저장"
        >
          <LinearGradient
            colors={Colors.gradient.cyanToPurple}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.saveButton}
          >
            <CompleteIcon width={14} height={14} />
            <Text style={styles.saveText}>저장</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* 취소 버튼 */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="취소"
        >
          <CancelIcon width={14} height={14} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    alignSelf: 'flex-end',
    maxWidth: '60%',
  },
  textArea: {
    height: 85,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple30,
    backgroundColor: Colors.glass.purple20,
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.15,
    padding: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  saveButtonWrapper: {
    flex: 1,
    borderRadius: Radii.md2,
    overflow: 'hidden',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderRadius: Radii.md2,
  },
  saveText: {
    color: Colors.primary.soulBlack,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  cancelButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
});
