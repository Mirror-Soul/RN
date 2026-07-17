import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function MatchingFooter() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* SKIP 버튼 */}
      <Pressable style={[styles.buttonSecondary, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <Ionicons name="close-outline" size={24} color={colors.text.muted} style={styles.iconMargin} />
        <Text style={[styles.textSecondary, { color: colors.text.muted }]}>SKIP</Text>
      </Pressable>

      {/* CHAT 버튼 */}
      <Pressable style={[styles.buttonSecondary, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <Ionicons name="chatbubble-outline" size={20} color={colors.text.muted} style={styles.iconMargin} />
        <Text style={[styles.textSecondary, { color: colors.text.muted }]}>CHAT</Text>
      </Pressable>

      {/* TWIN CALL 버튼 */}
      <Pressable style={styles.buttonPrimaryContainer}>
        <LinearGradient
          colors={Colors.gradient.twinCallButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonPrimary}
        >
          <Ionicons name="call-outline" size={20} color={Colors.primary.soulBlack} style={styles.iconMargin} />
          <Text style={styles.textPrimary}>TWIN CALL</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xxl,
    height: 96,
  },
  buttonSecondary: {
    width: '31%', // (122.66 / 400)
    height: 96,
    borderWidth: 1,
    borderRadius: Radii.xxl, // 32
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimaryContainer: {
    width: '31%',
    height: 96,
    borderRadius: Radii.xxl,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 35,
    elevation: 5,
  },
  buttonPrimary: {
    flex: 1,
    borderRadius: Radii.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconMargin: {
    marginBottom: Spacing.sm,
  },
  textSecondary: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  textPrimary: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    color: Colors.primary.soulBlack,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
