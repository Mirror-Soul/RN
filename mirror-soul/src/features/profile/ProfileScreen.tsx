import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatCallTime } from '@/src/utils/formatCallTime';
import { TimeRefillBottomSheet } from './components/TimeRefillBottomSheet';
import { useProfileQuery } from './hooks/useProfileQuery';
import { useTimeStatusQuery } from './hooks/useTimeStatusQuery';

type SettingLinkProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  iconBackground: string;
  label: string;
  description: string;
  onPress: () => void;
  isLast?: boolean;
};

const SettingLink = ({
  icon,
  iconColor,
  iconBackground,
  label,
  description,
  onPress,
  isLast = false,
}: SettingLinkProps) => {
  const { colors } = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 열기`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        !isLast && [styles.settingDivider, { borderColor: colors.border.primary }],
        pressed && { backgroundColor: colors.background.glass },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBackground }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingLabel, { color: colors.text.primary }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.text.muted} />
    </Pressable>
  );
};

/**
 * 마이페이지 프로필
 *
 * GET /my-page의 이름·이메일, GET /my-page/buy-time의 잔여 시간을 중심으로 구성한다.
 * 서버가 제공하지 않는 나이, MBTI, 직업, Twin 유사도 등은 임의의 목업으로 표시하지 않는다.
 */
export const ProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeColors();
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useProfileQuery();
  const { data: timeStatus, isLoading: isTimeLoading, isError: isTimeError, refetch: refetchTime } = useTimeStatusQuery();
  const [isRefillSheetOpen, setIsRefillSheetOpen] = useState(false);

  const displayName = profile?.name?.trim() || '내 프로필';
  const avatarInitial = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);
  const remainingTime = formatCallTime(timeStatus?.remainingTalkTime ?? 0);

  const handleOpenAccount = useCallback(() => router.push('/(main)/account'), [router]);
  const handleOpenIntroduction = useCallback(() => router.push('/(main)/profile-introduction'), [router]);
  const handleOpenVoiceAudio = useCallback(() => router.push('/(main)/voice-audio'), [router]);
  const handleOpenNotification = useCallback(() => router.push('/(main)/notification'), [router]);
  const handleOpenCustomerCenter = useCallback(() => router.push('/(main)/customer-center'), [router]);
  const handleOpenTermsPolicy = useCallback(() => router.push('/(main)/terms-policy'), [router]);
  const handleOpenAllSettings = useCallback(() => router.push('/(main)/profile-settings'), [router]);

  return (
    <>
      <ScreenLayout withScroll={true} paddingBottomOffset={112}>
        <View style={[styles.content, { paddingTop: insets.top + Spacing.md }]}>
          <Animated.View entering={FadeInDown.duration(360)} style={styles.topBar}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.text.muted }]}>MY SPACE</Text>
              <Text style={[styles.screenTitle, { color: colors.text.primary }]}>프로필</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="전체 설정 열기"
              hitSlop={8}
              onPress={handleOpenAllSettings}
              style={({ pressed }) => [
                styles.settingsButton,
                { backgroundColor: colors.background.card, borderColor: colors.border.primary },
                pressed && { opacity: 0.72 },
              ]}
            >
              <Feather name="settings" size={19} color={colors.text.primary} />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(50).duration(420).springify()}
            style={[styles.identityCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
          >
            <LinearGradient
              colors={isDark ? ['rgba(0, 211, 243, 0.13)', 'rgba(194, 122, 255, 0.08)'] : ['rgba(0, 71, 255, 0.08)', 'rgba(194, 122, 255, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={styles.identityRow}>
              <LinearGradient
                colors={Colors.gradient.cyanToPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </LinearGradient>
              <View style={styles.identityCopy}>
                {isProfileLoading ? (
                  <ActivityIndicator color={colors.brand.accent} />
                ) : isProfileError ? (
                  <Pressable onPress={() => refetchProfile()} accessibilityRole="button" accessibilityLabel="프로필 다시 조회">
                    <Text style={[styles.profileError, { color: colors.state.danger }]}>프로필을 불러오지 못했습니다 · 다시 시도</Text>
                  </Pressable>
                ) : (
                  <>
                    <Text style={[styles.profileName, { color: colors.text.primary }]} numberOfLines={1}>{displayName}</Text>
                    <Text style={[styles.profileEmail, { color: colors.text.secondary }]} numberOfLines={1}>{profile?.email}</Text>
                  </>
                )}
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="내 소개 열기"
              onPress={handleOpenIntroduction}
              style={({ pressed }) => [styles.accountButton, { borderColor: colors.border.strong }, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.accountButtonText, { color: colors.text.primary }]}>내 소개 보기</Text>
              <Feather name="arrow-up-right" size={15} color={colors.text.primary} />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(420).springify()}
            style={[styles.timeCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
          >
            <View style={styles.timeHeadingRow}>
              <View style={[styles.timeIcon, { backgroundColor: isDark ? Colors.glass.cyan10_d3 : 'rgba(0, 71, 255, 0.09)' }]}>
                <Feather name="clock" size={17} color={colors.brand.accent} />
              </View>
              <Text style={[styles.timeLabel, { color: colors.text.secondary }]}>남은 대화 시간</Text>
            </View>
            {isTimeLoading ? (
              <ActivityIndicator style={styles.timeLoading} color={colors.brand.accent} />
            ) : isTimeError ? (
              <Pressable onPress={() => refetchTime()} accessibilityRole="button" accessibilityLabel="남은 대화 시간 다시 조회">
                <Text style={[styles.timeError, { color: colors.state.danger }]}>시간을 불러오지 못했습니다 · 다시 시도</Text>
              </Pressable>
            ) : (
              <Text style={[styles.timeValue, { color: colors.text.primary }]}>{remainingTime}</Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="대화 시간 채우기"
              onPress={() => setIsRefillSheetOpen(true)}
              style={({ pressed }) => [styles.refillButton, { backgroundColor: colors.background.glass }, pressed && { opacity: 0.7 }]}
            >
              <Feather name="plus" size={16} color={colors.brand.accent} />
              <Text style={[styles.refillButtonText, { color: colors.brand.accent }]}>시간 채우기</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(420).springify()} style={styles.managementSection}>
            <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>관리 및 설정</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <SettingLink
                icon="user"
                iconColor={colors.brand.accent}
                iconBackground={isDark ? Colors.glass.cyan10_d3 : 'rgba(0, 71, 255, 0.09)'}
                label="계정 관리"
                description="닉네임, 테마, 로그아웃"
                onPress={handleOpenAccount}
              />
              <SettingLink
                icon="mic"
                iconColor={Colors.primary.vividPurple}
                iconBackground="rgba(194, 122, 255, 0.12)"
                label="음성 및 오디오"
                description="통화 음량과 재생 속도"
                onPress={handleOpenVoiceAudio}
              />
              <SettingLink
                icon="bell"
                iconColor={Colors.primary.mirrorOrange}
                iconBackground="rgba(255, 137, 4, 0.12)"
                label="알림 설정"
                description="부재중 통화와 잔여 시간 알림"
                onPress={handleOpenNotification}
              />
              <SettingLink
                icon="headphones"
                iconColor={Colors.primary.vividPink}
                iconBackground="rgba(246, 51, 154, 0.12)"
                label="고객 센터"
                description="자주 묻는 질문과 이메일 문의"
                onPress={handleOpenCustomerCenter}
              />
              <SettingLink
                icon="file-text"
                iconColor={colors.text.muted}
                iconBackground={colors.background.glass}
                label="약관 및 정책"
                description="서비스 이용약관 및 개인정보 처리방침"
                onPress={handleOpenTermsPolicy}
                isLast={true}
              />
            </View>
          </Animated.View>
        </View>
      </ScreenLayout>

      <TimeRefillBottomSheet isOpen={isRefillSheetOpen} onClose={() => setIsRefillSheetOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xxl },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl,
  },
  eyebrow: { fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: FontSize.xs, letterSpacing: 1.4 },
  screenTitle: {
    fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: FontSize.xxxl, lineHeight: 31, letterSpacing: -0.7, marginTop: Spacing.xxs,
  },
  settingsButton: {
    width: 42, height: 42, borderRadius: Radii.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  identityCard: { borderWidth: 1, borderRadius: Radii.xl, padding: Spacing.lg, overflow: 'hidden' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 58, height: 58, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: Colors.primary.soulBlack, fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: FontSize.xxl },
  identityCopy: { flex: 1, minHeight: 44, justifyContent: 'center' },
  profileName: { fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: FontSize.xl, lineHeight: 24, letterSpacing: -0.35 },
  profileEmail: { fontFamily: FontFamily.sans, fontWeight: FontWeight.regular, fontSize: FontSize.sm, lineHeight: 18, marginTop: Spacing.xxs },
  profileError: { fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.sm, textDecorationLine: 'underline' },
  accountButton: {
    minHeight: 38, borderWidth: 1, borderRadius: Radii.md, marginTop: Spacing.lg, paddingHorizontal: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs,
  },
  accountButtonText: { fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.sm },
  timeCard: { borderWidth: 1, borderRadius: Radii.xl, padding: Spacing.lg, marginTop: Spacing.md },
  timeHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  timeIcon: { width: 30, height: 30, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  timeLabel: { fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.sm },
  timeValue: { fontFamily: FontFamily.mono, fontWeight: FontWeight.bold, fontSize: 34, lineHeight: 41, letterSpacing: -1.2, marginTop: Spacing.lg },
  timeLoading: { height: 41, alignSelf: 'flex-start', marginTop: Spacing.lg },
  timeError: { fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.sm, marginTop: Spacing.lg, textDecorationLine: 'underline' },
  refillButton: {
    alignSelf: 'flex-start', minHeight: 36, borderRadius: Radii.md, marginTop: Spacing.md, paddingHorizontal: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
  },
  refillButtonText: { fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.sm },
  managementSection: { marginTop: Spacing.xxl },
  sectionLabel: { fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: FontSize.sm, letterSpacing: 0.6, marginLeft: Spacing.xs, marginBottom: Spacing.sm },
  settingsCard: { borderWidth: 1, borderRadius: Radii.xl, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', minHeight: 68, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  settingDivider: { borderBottomWidth: 1 },
  settingIcon: { width: 34, height: 34, borderRadius: Radii.md, justifyContent: 'center', alignItems: 'center' },
  settingCopy: { flex: 1 },
  settingLabel: { fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.base, lineHeight: 19 },
  settingDescription: { fontFamily: FontFamily.sans, fontWeight: FontWeight.regular, fontSize: FontSize.sm, lineHeight: 16, marginTop: Spacing.xxs },
});
