import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors, FontFamily } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

// 피그마 원본 파형 높이 데이터 (px 단위, 최대 ~4px)
const WAVEFORM_HEIGHTS = [
  1.22, 0.62, 3.99, 3.92, 3.74, 3.47, 3.13, 2.73, 2.27, 1.77,
  1.22, 0.62, 3.99, 3.92, 3.74, 3.47, 3.13, 2.73, 2.27, 1.77,
];

// 시각적으로 더 두드러지게 스케일업 (원본 * 5 = 최대 약 20px)
const SCALE_FACTOR = 5;

interface WaveBarProps {
  baseHeight: number;
  index: number;
  isPlaying: boolean;
}

const WaveBar = ({ baseHeight, index, isPlaying }: WaveBarProps) => {
  const scaleY = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      // 각 막대마다 스태거 딜레이 + 반복 사인 웨이브 효과
      scaleY.value = withDelay(
        index * 50,
        withRepeat(
          withSequence(
            withTiming(1.8, { duration: 300 + index * 15 }),
            withTiming(0.6, { duration: 300 + index * 15 }),
            withTiming(1.4, { duration: 200 }),
            withTiming(0.8, { duration: 200 }),
          ),
          -1,
          true,
        ),
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      cancelAnimation(scaleY);
      cancelAnimation(opacity);
      scaleY.value = withSpring(1, { stiffness: 200, damping: 20 });
      opacity.value = withTiming(0.4, { duration: 300 });
    }
  }, [isPlaying, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.waveBar,
        { height: baseHeight * SCALE_FACTOR },
        animatedStyle,
      ]}
    />
  );
};

interface ProfileDigitalVoiceSectionProps {
  voiceTitle: string;
  duration: string;
  delay?: number;
}

export const ProfileDigitalVoiceSection = ({
  voiceTitle,
  duration,
  delay = 200,
}: ProfileDigitalVoiceSectionProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const { colors } = useThemeColors();

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(550).springify()}
      style={styles.container}
    >
      {/* 섹션 헤딩 */}
      <Text style={styles.headingText}>Digital Voice</Text>

      {/* 음성 카드 */}
      <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
        {/* 재생 버튼 */}
        <Pressable 
          onPress={handlePlayToggle} 
          style={styles.playButtonWrapper}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "일시정지" : "재생하기"}
          accessibilityState={{ expanded: isPlaying }}
        >
          <LinearGradient
            colors={['#00D3F3', '#AD46FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playButton}
          >
            <View style={styles.playIconMargin}>
              <Feather
                name={isPlaying ? 'pause' : 'play'}
                size={22}
                color="#FFFFFF"
              />
            </View>
          </LinearGradient>
        </Pressable>

        {/* 음성 정보 */}
        <View style={styles.voiceInfo}>
          {/* 제목 */}
          <Text style={[styles.voiceTitle, { color: colors.text.primary }]} numberOfLines={1}>
            {voiceTitle}
          </Text>

          {/* 파형 + 재생 시간 */}
          <View style={styles.waveformRow}>
            <View style={styles.waveformBars}>
              {WAVEFORM_HEIGHTS.map((h, i) => (
                <WaveBar
                  key={i}
                  baseHeight={h}
                  index={i}
                  isPlaying={isPlaying}
                />
              ))}
            </View>
            <Text style={[styles.durationText, { color: colors.text.muted }]}>{duration}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  // 헤딩
  headingText: {
    fontFamily: FontFamily.sans,
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 2.12,
    textTransform: 'uppercase',
    color: Colors.neutral.disabledText,
    marginBottom: 16,
  },

  // 카드
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderRadius: 40,
  },

  // 재생 버튼
  playButtonWrapper: {
    shadowColor: 'rgba(0, 184, 219, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 0,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconMargin: {
    paddingLeft: 3, // play 아이콘의 시각적 중앙 보정
  },

  // 음성 정보
  voiceInfo: {
    flex: 1,
    gap: 4,
  },
  voiceTitle: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
  },

  // 파형
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 4,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    flex: 1,
  },
  waveBar: {
    width: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 211, 243, 0.6)',
  },
  durationText: {
    fontFamily: FontFamily.mono,
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 15,
  },
});
