import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Question {
  id: number;
  left: string;
  right: string;
  category: string;
}

// 밸런스 게임 질문 — 다른 곳에서 재사용되지 않으므로 별도 상수 파일 없이 colocate
const QUESTIONS: Question[] = [
  { id: 1, left: '안정적인 삶', right: '도전적인 삶', category: 'Life Style' },
  { id: 2, left: '계획적인 휴식', right: '즉흥적인 여행', category: 'Preference' },
  { id: 3, left: '깊고 좁은 관계', right: '넓고 얕은 관계', category: 'Social' },
  { id: 4, left: '논리적인 판단', right: '감성적인 공감', category: 'Decision' },
];

interface ValueBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/**
 * ValueBalanceModal 컴포넌트 (SRP)
 * 가치관 밸런스 게임(이지선다 4문항) 바텀시트입니다.
 */
export default function ValueBalanceModal({ isOpen, onClose, onComplete }: ValueBalanceModalProps) {
  const { colors } = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFinishing(false);
    }
  }, [isOpen]);

  const handleSelect = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    } else {
      setIsFinishing(true);
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    }
  };

  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentIndex];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={620}>
      <View style={styles.container}>
        <View style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {!isFinishing ? (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Balance Game</Text>
                <Text style={[styles.title, { color: colors.text.primary }]}>가치관 밸런스</Text>
              </View>
            </View>

            <View style={styles.questionArea}>
              <View style={styles.categoryWrapper}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                  <Text style={[styles.categoryText, { color: colors.text.muted }]}>{question.category}</Text>
                </View>
                <Text style={[styles.question, { color: colors.text.primary }]}>당신은 어떤 쪽인가요?</Text>
              </View>

              <View style={styles.choices}>
                <TouchableOpacity
                  style={[styles.choiceButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                  onPress={handleSelect}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={question.left}
                >
                  <Text style={[styles.choiceText, { color: colors.text.secondary }]}>{question.left}</Text>
                </TouchableOpacity>

                <View style={styles.vsWrapper}>
                  <View style={[styles.vsBadge, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                    <Text style={[styles.vsText, { color: colors.text.muted }]}>VS</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.choiceButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                  onPress={handleSelect}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={question.right}
                >
                  <Text style={[styles.choiceText, { color: colors.text.secondary }]}>{question.right}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.stepText, { color: colors.text.muted }]}>
              Question {currentIndex + 1} of {QUESTIONS.length}
            </Text>
          </>
        ) : (
          <View style={styles.finishing}>
            <View style={styles.finishingBadge}>
              <Ionicons name="sparkles-outline" size={40} color={Colors.primary.electricCyan} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>분석 완료</Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              트윈의 가치관 데이터가 <Text style={styles.accentText}>+1.2%</Text> 정밀해졌습니다.
            </Text>
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
  progressTrack: {
    height: 4,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.electricCyan,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  eyebrow: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.glass.cyan30_d3,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  questionArea: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.giant,
  },
  categoryWrapper: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    textTransform: 'uppercase',
  },
  question: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  choices: {
    gap: Spacing.md,
  },
  choiceButton: {
    padding: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  choiceText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  vsWrapper: {
    alignItems: 'center',
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
  },
  stepText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  finishing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  finishingBadge: {
    width: 96,
    height: 96,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan20_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan30_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  accentText: {
    color: Colors.primary.electricCyan,
  },
});
