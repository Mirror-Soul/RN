import MyselfIcon from '@/assets/images/common/evlove/evlove_myself.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 내 트윈과 대화하기 배너 (SRP)
 */
export default function EvolveMyselfCard() {
  return (
    <TouchableOpacity activeOpacity={0.85}>
      <LinearGradient
        colors={['rgba(0, 211, 243, 0.10)', 'rgba(194, 122, 255, 0.10)', 'rgba(251, 100, 182, 0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.contentRow}>
          {/* 좌측 아이콘 */}
          <LinearGradient
            colors={[Colors.glass.cyan30, Colors.glass.purple30]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconBg}
          >
            <MyselfIcon width={20} height={20} />
          </LinearGradient>

          {/* 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>내 트윈과 대화하기</Text>
            <Text style={styles.subTitle}>지금 어떻게 답변하는지 확인해보세요</Text>
          </View>

          {/* 우측 화살표 */}
          <Text style={styles.arrow}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    borderColor: Colors.glass.white20,
    alignSelf: 'stretch',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: Radii.md2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  subTitle: {
    color: Colors.neutral.lightGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  arrow: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
