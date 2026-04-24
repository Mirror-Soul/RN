import { Colors, Layout } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GrowScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>성장 탭 (작업 예정)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.neutral.lightGray,
  },
});
