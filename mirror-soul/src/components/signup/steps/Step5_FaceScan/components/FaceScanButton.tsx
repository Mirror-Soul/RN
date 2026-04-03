import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/constants/theme';
import CameraIcon from '@/assets/images/common/Camera_icon.svg';

interface Props {
  onPress?: () => void;
}

export default function FaceScanButton({ onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={Colors.gradient.cyanToPurple}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        <CameraIcon width={24} height={24} />
        <Text style={styles.text}>Start Scan</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56, // approx 55.992
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: Colors.primary.soulBlack,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
});
