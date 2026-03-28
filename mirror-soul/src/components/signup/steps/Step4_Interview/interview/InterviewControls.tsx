import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import VoiceIcon from '@/assets/images/common/Voice_icon.svg';
import ContinueIcon from '@/assets/images/common/Continue_icon.svg';

interface Props {
  onRecordPress: () => void;
  onNextPress: () => void;
}

export default function InterviewControls({ onRecordPress, onNextPress }: Props) {
  return (
    <View style={styles.container}>
      {/* 1. 녹음 시작 시작 버튼 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRecordPress}
        style={styles.recordButtonWrapper}
      >
        <LinearGradient
          colors={['#00D3F3', '#51A2FF', '#C27AFF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.recordGradient}
        >
          <VoiceIcon width={24} height={24} />
          <Text style={styles.recordText}>녹음 시작</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 2. 다음 버튼 */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onNextPress}
        style={styles.nextButton}
      >
        <Text style={styles.nextText}>다음</Text>
        <ContinueIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 72, // roughly matching Figma 71.656px
  },
  recordButtonWrapper: {
    flex: 1,
    height: '100%',
    borderRadius: 16,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.30,
    shadowRadius: 50,
    elevation: 10,
  },
  recordGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  recordText: {
    color: Colors.primary.soulBlack,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
  nextButton: {
    width: 142.796,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1.836,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  nextText: {
    color: Colors.neutral.disabledText,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
