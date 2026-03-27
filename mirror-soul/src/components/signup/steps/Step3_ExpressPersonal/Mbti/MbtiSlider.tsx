import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Platform } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  leftLabel: string;
  rightLabel: string;
  leftChar: string;
  rightChar: string;
  value: number; // 0 to 100
  onChange: (value: number) => void;
}

export default function MbtiSlider({ leftLabel, rightLabel, leftChar, rightChar, value, onChange }: Props) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.min(Math.max(0, (gestureState.moveX - (Platform.OS === 'ios' ? 48 : 48)) / sliderWidth * 100), 100);
        // 실제로는 레이아웃 좌표 계산이 필요하지만 간략화를 위해 터치 위치를 비율로 계산
        // 정확한 구현을 위해 onLayout에서 위치 정보를 받아와야 함
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // 단순화를 위해 현재는 클릭/수치 조절 대신 슬라이더의 시각적 로직만 먼저 구성합니다.
  // 실제 인터랙션은 실시간 텍스트 피드백 조건을 위해 더 세밀하게 조정할 예정입니다.

  const percentage = Math.round(value);
  const activeLabel = value < 50 ? leftLabel : rightLabel;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelGroup}>
          <View style={[styles.charBox, value < 50 && styles.charBoxActiveLeft]}>
            <Text style={styles.charText}>{leftChar}</Text>
          </View>
          <Text style={styles.labelText}>{leftLabel}</Text>
        </View>

        <View style={styles.labelGroup}>
          <Text style={styles.labelText}>{rightLabel}</Text>
          <View style={[styles.charBox, value >= 50 && styles.charBoxActiveRight]}>
            <Text style={styles.charText}>{rightChar}</Text>
          </View>
        </View>
      </View>

      <View 
        style={styles.track}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={['#C27AFF', 'rgba(0, 0, 0, 0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradientLeft}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', '#00D3F3']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientRight}
        />
        <View style={styles.centerLine} />
        
        {/* Slider Handle */}
        <View style={[styles.handle, { left: `${value}%` }]}>
          <View style={styles.handleInner} />
        </View>
      </View>

      <Text style={styles.percentageText}>
         {value < 50 ? `${100 - percentage}% ${leftLabel}` : `${percentage}% ${rightLabel}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  charBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  charBoxActiveLeft: {
    borderColor: 'rgba(147, 51, 234, 0.30)',
    backgroundColor: 'rgba(147, 51, 234, 0.10)',
  },
  charBoxActiveRight: {
    borderColor: 'rgba(0, 255, 255, 0.80)',
    backgroundColor: 'rgba(0, 255, 255, 0.30)',
  },
  charText: {
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  labelText: {
    color: '#99A1AF',
    fontSize: 14,
    letterSpacing: -0.15,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
  gradientLeft: {
    position: 'absolute',
    left: 0,
    width: '50%',
    height: '100%',
    borderRadius: 4,
  },
  gradientRight: {
    position: 'absolute',
    right: 0,
    width: '50%',
    height: '100%',
    borderRadius: 4,
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
  },
  handle: {
    position: 'absolute',
    width: 24,
    height: 24,
    marginLeft: -12, // Handle center
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1.836,
    borderColor: '#0FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      }
    })
  },
  handleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0FF',
  },
  percentageText: {
    color: '#6A7282',
    textAlign: 'center',
    fontSize: 12,
  }
});
