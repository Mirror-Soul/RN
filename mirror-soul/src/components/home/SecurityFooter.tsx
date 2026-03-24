import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// SVG 파일을 컴포넌트로 활용
import ProtectIcon from "../../../assets/images/common/Protect.svg";
import { Colors } from '@/src/constants/theme';

/**
 * 하단 보안 알림 렌더링 컴포넌트
 */
export default function SecurityFooter() {
  return (
    <View style={styles.container}>
      <ProtectIcon width={18} height={18} />
      <Text style={styles.text}>Your soul data is encrypted on-device</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6.5,
  },
  text: {
    color: Colors.neutral.darkGray,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  }
});
