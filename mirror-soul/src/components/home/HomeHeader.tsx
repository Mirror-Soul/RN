import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';

/**
 * HomeHeader 컴포넌트
 * "Mirror Soul" 리니어 그라디언트 타이포그래피와 "The Threshold of Soul" 부제를 렌더링.
 */
export default function HomeHeader() {
  return (
    <View style={styles.container}>
      {/* Gradient Text Container */}
      <View style={styles.titleWrapper}>
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <View style={styles.maskContainer}>
              <Text style={styles.title}>Mirror Soul</Text>
            </View>
          }
        >
          <LinearGradient
            colors={Colors.gradient.cyanToPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </MaskedView>
        <Text style={[styles.title, { opacity: 0 }]}>Mirror Soul</Text> 
        {/* 보이지 않는 텍스트로 레이아웃 공간 차지 (MaskedView 높이 확보) */}
      </View>
      
      <Text style={styles.subtitle}>The Threshold of Soul</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  titleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
    letterSpacing: 0.369,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral.lightGray,
    fontWeight: '400',
    letterSpacing: -0.15,
  }
});
