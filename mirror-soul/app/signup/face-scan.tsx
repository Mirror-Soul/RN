import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';

// Component Imports
import FaceScanGlow from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanGlow';
import FaceScanHeader from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanHeader';
import FaceScanBody from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanBody';
import FaceScanButton from '@/src/components/signup/steps/Step5_FaceScan/components/FaceScanButton';

export default function FaceScanScreen() {
  const router = useRouter();

  const handleStartScan = () => {
    console.log('카메라 권한 요청 및 얼굴 스캔 시작 동작 바인딩 예정');
  };

  return (
    <View style={styles.baseContainer}>
      <FaceScanGlow />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          {/* 타이틀 및 구성 컴포넌트 탑재 */}
          <View style={styles.headerWrapper}>
            <FaceScanHeader />
          </View>

          <View style={styles.bodyWrapper}>
            <FaceScanBody />
          </View>

          <View style={styles.buttonWrapper}>
            <FaceScanButton onPress={handleStartScan} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // 보통 스크린 상단 여백
    paddingBottom: 50,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 345, // Figma design width
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerWrapper: {
    width: '100%',
    marginTop: 0, // 상단 레이아웃에 Steps Indicator가 있으므로 기본 여백으로 수정
  },
  bodyWrapper: {
    width: '100%',
    marginTop: 32, // Header와 Body 간격
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 40, // Body와 Button 간격
  },
});
