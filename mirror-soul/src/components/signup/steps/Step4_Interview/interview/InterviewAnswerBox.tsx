import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

export default function InterviewAnswerBox() {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>당신의 답변</Text>
      <Text style={styles.guideText}>녹음 버튼을 눌러 답변을 시작하세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 24.606,
    paddingRight: 24.606,
    paddingBottom: 44.932,
    paddingLeft: 24.606,
    borderRadius: 24,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: 'rgba(0, 0, 0, 0.40)', // Overlay black
    shadowColor: Colors.primary.soulBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 5,
    gap: 12,
  },
  titleText: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  guideText: {
    color: Colors.neutral.darkGray,
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: -0.312,
  },
});
