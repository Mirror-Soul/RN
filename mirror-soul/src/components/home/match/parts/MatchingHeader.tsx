import SettingIcon from '@/assets/images/common/Setting.svg';
import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
/**
 * 매칭 화면 헤더 (뒤로가기 제거, 제목 중앙 정렬)
 */
export default function MatchingHeader() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.header}>
      {/* 타이틀 중앙 정렬을 위한 더미 뷰 (좌측) */}
      <View style={styles.dummyView} />

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>매칭</Text>
      </View>

      <TouchableOpacity 
        activeOpacity={0.7} 
      >
        <View style={[styles.circleButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
          <SettingIcon width={24} height={24} />
        </View>
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
  dummyView: {
    width: 40,
    height: 40,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    borderWidth: 0.612,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
