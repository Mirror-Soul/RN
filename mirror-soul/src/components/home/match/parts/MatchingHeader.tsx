import BackIcon from '@/assets/images/common/back.svg';
import SettingIcon from '@/assets/images/common/Setting.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 매칭 화면 헤더 (뒤로가기, 제목, 설정 버튼)
 */
export default function MatchingHeader() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => router.back()}
        style={styles.circleButton}
      >
        <BackIcon width={24} height={24} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>매칭</Text>
      </View>

      <TouchableOpacity 
        activeOpacity={0.7} 
        style={styles.circleButton}
      >
        <SettingIcon width={24} height={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
