import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';

/**
 * LoginHeader 컴포넌트
 * "Mirror Soul" 리니어 그라디언트 로고와 "당신의 영혼을 비추는 거울" 부제를 렌더링.
 */
export default function LoginHeader() {
  return (
    <View style={styles.container}>
      {/* Container/Header/Heading1 */}
      <View style={styles.heading1}>
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
          {/* Layout spacer for absolute MaskedView */}
          <Text style={[styles.title, { opacity: 0 }]}>Mirror Soul</Text>
        </View>
      </View>

      {/* Container/Header/Paragraph */}
      <View style={styles.paragraph}>
        <Text style={styles.subtitle}>당신의 영혼을 비추는 거울</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 67.98,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 7.995,
  },
  heading1: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraph: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
    letterSpacing: 0.369,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#99A1AF',
    textAlign: 'center',
    letterSpacing: -0.15,
  },
});
