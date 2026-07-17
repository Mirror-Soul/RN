import CancelIcon from '@/assets/images/common/Cancel.svg';
import CompleteIcon from '@/assets/images/common/Complete.svg';
import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatEditFormProps {
  onSave: () => void;
  onCancel: () => void;
}

/**
 * 말풍선 내부용 액션 버튼 바 (SRP)
 * 제자리 수정(In-place) 모드 시 말풍선 하단에 표시됩니다.
 */
export default function ChatEditForm({ onSave, onCancel }: ChatEditFormProps) {
  return (
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
          <CompleteIcon width={12} height={12} />
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
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <CancelIcon width={12} height={12} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  saveButtonWrapper: {
    flex: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  saveText: {
    color: Colors.primary.soulBlack,
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
});
