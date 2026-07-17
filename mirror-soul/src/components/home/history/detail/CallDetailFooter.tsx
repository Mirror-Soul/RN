import {Colors, FontFamily} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 통화 상세 하단 푸터 (SRP)
 * Twin 학습 안내 문구를 표시합니다.
 */
export default function CallDetailFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.text}>수정된 답변은 Twin의 학습에 반영됩니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 0.612,
    borderTopColor: Colors.glass.white10,
    backgroundColor: Colors.glass.black40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  text: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
  },
});
