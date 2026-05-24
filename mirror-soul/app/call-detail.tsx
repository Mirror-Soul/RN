import CallDetailAlert from '@/src/components/home/history/detail/CallDetailAlert';
import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailFooter from '@/src/components/home/history/detail/CallDetailFooter';
import CallDetailHeader from '@/src/components/home/history/detail/CallDetailHeader';
import { Colors } from '@/src/constants/theme';
import { MOCK_CALL_HISTORY } from '@/src/mocks/historyMocks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 통화 기록 상세 화면 (루트 스택 레벨)
 * HistoryCallCard 탭 시 진입하며, BottomNavbar 없이 풀스크린으로 표시됩니다.
 */
export default function CallDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // id로 통화 데이터 조회 (API 연동 시 useQuery 등으로 교체)
  const callItem = MOCK_CALL_HISTORY.find((item) => item.id === id);

  if (!callItem) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>통화 기록을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CallDetailHeader
        name={callItem.name}
        age={callItem.age}
        callSequenceNumber={callItem.callSequenceNumber}
        consistencyPercent={callItem.consistencyPercent}
        onBack={() => router.back()}
      />
      <CallDetailAlert />
      <CallDetailBody key={callItem.id} initialMessages={callItem.messages} />
      <View style={{ paddingBottom: insets.bottom }}>
        <CallDetailFooter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  errorText: {
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Inter',
    fontSize: 14,
  },
});
