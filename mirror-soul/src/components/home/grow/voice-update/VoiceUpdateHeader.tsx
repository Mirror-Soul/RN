import BackIcon from '@/assets/images/common/back.svg';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 목소리 업데이트 헤더 (SRP)
 * 뒤로가기 버튼과 중앙 타이틀을 렌더링합니다.
 */
export default function VoiceUpdateHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="뒤로가기"
        accessibilityRole="button"
      >
        <BackIcon width={24} height={24} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>목소리 업데이트</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: 8,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: Colors.neutral.pureWhite,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.449,
  },
});
