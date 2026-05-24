import EditPencilIcon from '@/assets/images/common/history/call_history/call_edit_pencil.svg';
import PurpleInfoIcon from '@/assets/images/common/history/call_history/puple_info.svg';
import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 통화 상세 상단 알림 배너 (SRP)
 * 편집 기능 안내 문구를 자주색 글래스 배너로 표시합니다.
 */
export default function CallDetailAlert() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <PurpleInfoIcon width={16} height={16} />
        <View style={styles.paragraph}>
          <Text style={styles.text}>우측 상단의 </Text>
          <EditPencilIcon width={12} height={12} />
          <Text style={styles.text}> 아이콘을 탭하여 내 Twin의 답변을 수정할 수 있습니다</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.purple20,
    backgroundColor: Colors.glass.purple10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  paragraph: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  text: {
    color: Colors.neutral.lavender,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
