import SettingIcon from '@/assets/images/common/Setting.svg';
import ProfileIcon from '@/assets/images/common/bottomNavbar/Profile.svg';
import { Colors, FontFamily, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { MAIN_ROUTES } from '@/src/constants/routes/mainRoutes';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';

interface MainHeaderProps {
  onSettingPress?: () => void;
}

/**
 * MainHeader 컴포넌트 (SRP)
 * 좌측 프로필 이동 버튼, "Discovery" 타이틀 + Live Sync 배지, 우측 설정 버튼을 렌더링합니다.
 */
export default function MainHeader({ onSettingPress }: MainHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={() => router.push(MAIN_ROUTES.PROFILE)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="내 트윈으로 이동"
      >
        <ProfileIcon width={20} height={20} />
      </TouchableOpacity>

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Discovery</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Sync</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={onSettingPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="설정"
      >
        <SettingIcon width={20} height={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: tabHeaderStyles.container,
  iconButton: tabHeaderStyles.iconButton,
  titleWrapper: {
    alignItems: 'center',
  },
  title: tabHeaderStyles.title,
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.electricCyan,
  },
  liveText: {
    fontFamily: FontFamily.sans,
    fontSize: 8,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.primary.electricCyan,
  },
});
