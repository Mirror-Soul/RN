import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

interface Props {
  onVerify: () => void;
}

export default function UnverifiedCard({ onVerify }: Props) {
  return (
    <View style={styles.cardContainer}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.glass.cyan10_d3, Colors.glass.purple10]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: Radii.lg }]}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>PASS 본인인증</Text>
        <Text style={styles.description}>안전한 매칭을 위해 PASS 앱으로 본인인증을 진행해주세요</Text>
        
        <View style={styles.bulletRow}>
          <View style={styles.bullet} />
          <Text style={styles.bulletText}>개인정보는 암호화되어 안전하게 보호됩니다</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.buttonWrapper} onPress={onVerify}>
        <LinearGradient
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radii.md2 }]}
        />
        <Text style={styles.buttonText}>PASS 본인인증 하기</Text>
      </TouchableOpacity>
      
      <Text style={styles.subText}>PASS 앱이 설치되어 있어야 합니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.cyan20,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 27,
    letterSpacing: -0.439,
  },
  description: {
    color: Colors.neutral.lightGray,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.electricCyan,
  },
  bulletText: {
    color: Colors.neutral.darkGray,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
  },
  buttonWrapper: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md2,
    marginBottom: Spacing.sm,
    overflow: 'hidden', 
  },
  buttonText: {
    color: Colors.primary.soulBlack,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  subText: {
    color: Colors.neutral.darkGray,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
  }
});
