import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/src/constants/theme';

interface InterviewVisualizerProps {
  isRecording?: boolean;
}

/**
 * InterviewVisualizer
 * 
 * 프리미엄 루핑 애니메이션 비주얼라이저입니다.
 * 실시간 오디오 대신, 정교하게 설계된 부드러운 파동 애니메이션을 통해 인터뷰의 현장감을 부여합니다.
 */
export default function InterviewVisualizer({ isRecording = false }: InterviewVisualizerProps) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      <View style={styles.waveWrapper}>
        {bars.map((i) => {
          const baseHeight = 12;
          
          // 각 막대마다 고유한 루프 애니메이션 시퀀스 설정 (유기적인 느낌을 위해)
          const recordingSequence = [
            baseHeight + 10 + (i % 3) * 10,
            baseHeight + 40 + (i % 2) * 15,
            baseHeight + 20 + (i % 4) * 8,
            baseHeight + 50 + (i % 3) * 12,
            baseHeight + 15
          ];

          return (
            <MotiView
              key={i}
              from={{ height: baseHeight, opacity: 0.1 }}
              animate={{
                // 녹음 중일 때는 활발한 파동 루프, 대기 중일 때는 부드러운 숨쉬기
                height: isRecording 
                  ? recordingSequence 
                  : [baseHeight, baseHeight + 12, baseHeight], 
                opacity: isRecording 
                  ? [0.4, 0.8, 0.5, 1, 0.4] 
                  : [0.1, 0.25, 0.1],
              }}
              transition={{
                height: isRecording 
                  ? { type: 'timing', duration: 1200 + (i * 100), loop: true, repeatReverse: true } 
                  : { type: 'timing', duration: 2500, loop: true, delay: i * 150 },
                opacity: { type: 'timing', duration: 2500, loop: true },
              }}
              style={[
                styles.bar,
                { 
                  backgroundColor: isRecording 
                    ? Colors.primary.electricCyan 
                    : Colors.primary.vividPurple,
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  waveWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bar: {
    width: 5,
    borderRadius: 2.5,
  },
});
