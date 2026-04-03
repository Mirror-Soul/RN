import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';

export default function FaceScanBody() {
  return (
    <View style={styles.container}>
      <LinearGradient
        // #101828 is equivalent to rgb(16,24,40). Using slate95 which is rgba(16,24,40,0.95)
        colors={[Colors.glass.slate95, Colors.primary.soulBlack]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }} // 135deg approximation
        style={styles.gradientBackground}
      />
      {/* 추후 카메라 뷰 연결될 공간 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 460, // approx 459.916px
    borderRadius: 24,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    overflow: 'hidden', // to keep gradient inside rounded corners
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
