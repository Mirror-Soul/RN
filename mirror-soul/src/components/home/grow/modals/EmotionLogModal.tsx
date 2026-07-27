import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Emotion {
  id: string;
  label: string;
  color: string;
  render: (color: string) => React.ReactNode;
}

const EMOTIONS: Emotion[] = [
  { id: 'happy', label: '평온한', color: '#FFDF20', render: (c) => <Feather name="sun" size={22} color={c} /> },
  { id: 'excited', label: '설레는', color: Colors.primary.electricCyan, render: (c) => <Ionicons name="sparkles-outline" size={22} color={c} /> },
  { id: 'neutral', label: '차분한', color: '#99A1AF', render: (c) => <Feather name="meh" size={22} color={c} /> },
  { id: 'sad', label: '촉촉한', color: '#51A2FF', render: (c) => <Feather name="cloud-rain" size={22} color={c} /> },
  { id: 'love', label: '따뜻한', color: Colors.gradient.matchingStart[0], render: (c) => <Feather name="heart" size={22} color={c} /> },
];

interface EmotionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * EmotionLogModal 컴포넌트 (SRP)
 * 오늘의 감정 조각 기록 바텀시트입니다.
 */
export default function EmotionLogModal({ isOpen, onClose, onComplete }: EmotionLogModalProps) {
  const { colors } = useThemeColors();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedEmotion(null);
      setMemo('');
      setIsFinishing(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedEmotion) return;
    setIsFinishing(true);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1500);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={620}>
      <View style={styles.container}>
        {!isFinishing ? (
          <>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Daily Mood Log</Text>
              <Text style={[styles.title, { color: colors.text.primary }]}>지금, 어떤 조각을 남길까요?</Text>
              <Text style={[styles.subtitle, { color: colors.text.muted }]}>오늘의 감정은 트윈의 대화 톤에 반영됩니다.</Text>
            </View>

            <View style={styles.emotionRow}>
              {EMOTIONS.map((emotion) => {
                const isSelected = selectedEmotion === emotion.id;
                return (
                  <TouchableOpacity
                    key={emotion.id}
                    onPress={() => setSelectedEmotion(emotion.id)}
                    style={[
                      styles.emotionButton,
                      { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                      isSelected && { borderColor: emotion.color },
                    ]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    {emotion.render(isSelected ? emotion.color : colors.text.muted)}
                    <Text style={[styles.emotionLabel, { color: isSelected ? emotion.color : colors.text.muted }]}>
                      {emotion.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[styles.textarea, { backgroundColor: colors.background.glass, borderColor: colors.border.primary, color: colors.text.primary }]}
              value={memo}
              onChangeText={setMemo}
              placeholder="지금 이 기분을 짧게 기록해보세요 (선택)"
              placeholderTextColor={colors.text.muted}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.text.primary }, !selectedEmotion && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedEmotion}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="기록 저장하기"
            >
              <Feather name="send" size={16} color={colors.background.primary} />
              <Text style={[styles.submitText, { color: colors.background.primary }]}>기록 저장하기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.finishing}>
            <View style={[styles.finishingBadge, { backgroundColor: Colors.glass.pink20, borderColor: Colors.glass.pink30 }]}>
              <Feather name="heart" size={36} color={Colors.gradient.matchingStart[0]} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>기록 완료</Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>오늘의 감정 조각이 트윈에게 전달되었습니다.</Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  eyebrow: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.gradient.matchingStart[0],
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  emotionButton: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.xl,
    borderWidth: 2,
  },
  emotionLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  textarea: {
    height: 128,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xl,
  },
  submitButton: {
    height: 64,
    borderRadius: Radii.xxl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.3,
  },
  submitText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  finishing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  finishingBadge: {
    width: 80,
    height: 80,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
