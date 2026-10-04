import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useThemeStore } from '@/src/store/useThemeStore';
import { performLogout } from '@/src/services/authService';
import { useProfileQuery } from '@/src/features/profile/hooks/useProfileQuery';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { PublicProfilePreview } from '@/src/features/profile/photo/PublicProfilePreview';
import { NicknameEditModal } from './components/NicknameEditModal';
import { LogoutBottomSheet } from './components/LogoutBottomSheet';
import { useAccountInfoQuery } from './hooks/useAccountInfoQuery';

export const AccountSettingsScreen = () => {
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const stackNickname = width < 360 || fontScale > 1.3;
  const { colors } = useThemeColors();
  const { themeMode, setThemeMode } = useThemeStore();
  const account = useAccountInfoQuery();
  const profile = useProfileQuery();
  const { refetch: refetchAccount } = account;
  const { refetch: refetchProfile } = profile;
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutLock = useRef(false);
  const refresh = useCallback(() => Promise.all([refetchAccount(), refetchProfile()]), [refetchAccount, refetchProfile]);
  useProfileRefresh(refresh, false, !preview && !editing && !logoutOpen);
  const logout = async () => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    setLoggingOut(true);
    try { await performLogout(); }
    catch { /* 로컬 정리 중 예외가 나도 로그인 화면으로 이동한다. */ }
    finally { setLogoutOpen(false); router.replace('/login'); }
  };
  const card = [styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }];
  const sectionTitle = [styles.sectionTitle, { color: colors.text.primary }];
  return (
    <ScreenLayout withScroll>
      <Header title="계정 관리" delay={0} onBackPress={() => router.canGoBack() ? router.back() : router.replace('/(main)/profile')} />
      <View style={styles.content}>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>내 정보와 앱 사용 환경을 관리해요.</Text>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={sectionTitle}>내 계정 정보</Text>
          <View style={card}>
            <View style={[styles.infoRow, styles.divider, { borderColor: colors.border.primary }]}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>닉네임</Text>
              <View style={[styles.nicknameHeading, stackNickname && styles.nicknameStacked]}>
                <View style={styles.nicknameValue}>{account.isLoading ? <ActivityIndicator color={colors.brand.accent} /> : <Text style={[styles.name, { color: colors.text.primary }]}>{account.data?.name || '닉네임을 확인해 주세요.'}</Text>}</View>
                <Pressable onPress={() => setEditing(true)} disabled={!account.data || loggingOut} accessibilityRole="button" accessibilityLabel="닉네임 변경" style={[styles.edit, { borderColor: colors.border.strong, opacity: account.data ? 1 : 0.5 }]}><Feather name="edit-2" size={16} color={colors.brand.accent} /><Text style={[styles.actionText, { color: colors.brand.accent }]}>변경</Text></Pressable>
              </View>
              {account.isError && <Retry fetching={account.isFetching} onRetry={() => { void account.refetch(); }} label="계정 정보 다시 불러오기" />}
              <Text style={[styles.copy, { color: colors.text.secondary }]}>프로필과 대화방에 표시되는 이름이에요.</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>로그인 이메일</Text>
              {profile.isLoading ? <ActivityIndicator color={colors.brand.accent} /> : <Text selectable style={[styles.value, { color: colors.text.primary }]}>{profile.data?.email || '이메일을 불러오지 못했어요.'}</Text>}
              {profile.isError && <Retry fetching={profile.isFetching} onRetry={() => { void profile.refetch(); }} label="로그인 이메일 다시 불러오기" />}
              <Text style={[styles.copy, { color: colors.text.secondary }]}>로그인할 때 사용하는 이메일이에요.{ '\n' }상대방에게는 공개되지 않아요.</Text>
            </View>
          </View>
          <View style={card}><AccountLink title="내 프로필 미리보기" description="상대방에게 보이는 내 모습을 확인해요." icon="user" onPress={() => setPreview(true)} /></View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={sectionTitle}>화면 스타일</Text>
          <View style={[card, styles.appearance]}>
            <Text style={[styles.copy, { color: colors.text.secondary }]}>기기 설정을 따르거나 원하는 화면을 선택해요.</Text>
            <View style={styles.themeOptions}>
              {([{ id: 'system', label: '기기 설정', icon: 'smartphone' }, { id: 'light', label: '밝게', icon: 'sun' }, { id: 'dark', label: '어둡게', icon: 'moon' }] as const).map(option => <Pressable key={option.id} onPress={() => setThemeMode(option.id)} accessibilityRole="radio" accessibilityLabel={`${option.label} 화면`} accessibilityState={{ checked: themeMode === option.id }} style={[styles.themeOption, { borderColor: themeMode === option.id ? colors.brand.accent : colors.border.primary, backgroundColor: colors.background.glass }]}><Feather name={option.icon} size={18} color={themeMode === option.id ? colors.brand.accent : colors.text.secondary} /><Text style={[styles.actionText, { color: themeMode === option.id ? colors.brand.accent : colors.text.primary }]}>{option.label}</Text>{themeMode === option.id && <Feather name="check" size={16} color={colors.brand.accent} />}</Pressable>)}
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={sectionTitle}>로그인과 도움말</Text>
          <View style={card}>
            <AccountLink title="로그인 도움이 필요해요" description="로그인·계정 문제를 고객센터에 문의해요." icon="help-circle" onPress={() => router.push('/(main)/customer-center')} />
            <AccountLink title="로그아웃" description="이 기기에서 로그아웃해요. 계정은 유지돼요." icon="log-out" onPress={() => setLogoutOpen(true)} disabled={loggingOut} />
          </View>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>비밀번호를 잊으셨다면 로그인 화면의 ‘비밀번호 찾기’에서 재설정할 수 있어요.</Text>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={sectionTitle}>회원 탈퇴</Text>
          <View style={card}><AccountLink title="탈퇴 안내 확인" description="계정 비활성화와 복구 기간을 먼저 확인해요." icon="user-minus" onPress={() => router.navigate('/(main)/account-delete')} danger disabled={loggingOut} /></View>
        </View>
        <Text style={[styles.version, { color: colors.text.secondary }]}>Mirror Soul · 버전 {Constants.expoConfig?.version || '1.0.0'}</Text>
      </View>
      {editing && <NicknameEditModal isOpen onClose={() => setEditing(false)} />}
      {preview && <PublicProfilePreview onClose={() => setPreview(false)} />}
      <LogoutBottomSheet isOpen={logoutOpen} isLoggingOut={loggingOut} onClose={() => { if (!logoutLock.current) setLogoutOpen(false); }} onLogout={() => { void logout(); }} />
    </ScreenLayout>
  );
};

function Retry({ fetching, onRetry, label }: { fetching: boolean; onRetry: () => void; label: string }) {
  const { colors } = useThemeColors();
  return <Pressable disabled={fetching} onPress={onRetry} accessibilityRole="button" accessibilityLabel={label} style={styles.retry}><Text style={[styles.actionText, { color: colors.brand.accent }]}>{fetching ? '불러오는 중…' : '다시 불러오기'}</Text></Pressable>;
}

function AccountLink({ title, description, icon, onPress, disabled = false, danger = false }: { title: string; description: string; icon: React.ComponentProps<typeof Feather>['name']; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  const { colors } = useThemeColors();
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title} style={({ pressed }) => [styles.link, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}><Feather name={icon} size={20} color={danger ? colors.state.danger : colors.brand.accent} /><View style={styles.linkCopy}><Text style={[styles.linkTitle, { color: danger ? colors.state.danger : colors.text.primary }]}>{title}</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>{description}</Text></View><Feather name="chevron-right" size={18} color={colors.text.secondary} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, gap: Spacing.xl },
  section: { gap: Spacing.sm },
  sectionTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, paddingHorizontal: Spacing.xs },
  card: { borderWidth: 1, borderRadius: Radii.lg, overflow: 'hidden' },
  infoRow: { padding: Spacing.lg, gap: Spacing.sm },
  divider: { borderBottomWidth: 1 },
  label: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  nicknameHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  nicknameStacked: { flexDirection: 'column', alignItems: 'stretch' },
  nicknameValue: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  name: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 29 },
  value: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  edit: { minHeight: 48, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap', maxWidth: '100%' },
  actionText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
  appearance: { padding: Spacing.lg, gap: Spacing.md },
  themeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  themeOption: { flexGrow: 1, flexBasis: 130, minHeight: 48, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md },
  link: { minHeight: 64, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  linkCopy: { flex: 1, gap: Spacing.xs },
  linkTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 24 },
  retry: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  version: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, textAlign: 'center', marginVertical: Spacing.sm },
});
