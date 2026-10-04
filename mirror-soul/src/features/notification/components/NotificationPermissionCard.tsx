import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export function NotificationPermissionCard() {
  const { colors } = useThemeColors();
  const [permission, setPermission] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);
  const [settingsError, setSettingsError] = useState(false);
  const [opening, setOpening] = useState(false);
  const alive = useRef(true);
  const generation = useRef(0);
  const lock = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current += 1; }; }, []);
  const check = useCallback(async () => {
    const attempt = ++generation.current;
    setChecking(true);
    try {
      const response = await Notifications.getPermissionsAsync();
      if (generation.current === attempt) { setPermission(response); setError(false); }
    } catch { if (generation.current === attempt) setError(true); }
    finally { if (generation.current === attempt) setChecking(false); }
  }, []);
  useProfileRefresh(check);
  const open = async () => {
    if (lock.current) return;
    lock.current = true;
    setOpening(true);
    setSettingsError(false);
    try { await Linking.openSettings(); }
    catch { if (alive.current) setSettingsError(true); }
    finally { lock.current = false; if (alive.current) setOpening(false); }
  };
  const quiet = permission?.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL || permission?.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL;
  const permitted = !!permission?.granted || quiet;
  const label = checking ? '기기 설정 확인 중' : error ? '기기 설정 확인 필요' : quiet ? '조용한 알림 허용됨' : permitted ? '기기 알림 허용됨' : '기기 알림 꺼짐';
  return (
    <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      <View style={styles.heading}><Feather name="bell" size={21} color={colors.brand.accent} /><Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>알림이 오지 않나요?</Text></View>
      <View style={styles.status}>{checking ? <ActivityIndicator size="small" color={colors.brand.accent} /> : <Feather name={permitted && !error ? 'check-circle' : 'info'} size={16} color={colors.text.secondary} />}<Text accessibilityLiveRegion="polite" style={[styles.statusText, { color: colors.text.secondary }]}>{label}</Text></View>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>기기 설정에서 Mirror Soul의{ '\n' }알림 허용 여부를 확인해 주세요.{ '\n' }{Platform.OS === 'android' ? '알림 소리와 메시지 알림 채널도 함께 확인할 수 있어요.' : '알림이 허용돼 있다면 집중 모드와 알림 소리 설정도 확인해 보세요.'}</Text>
      {error && <Pressable disabled={checking} onPress={() => { void check(); }} accessibilityRole="button" accessibilityLabel="기기 알림 권한 다시 확인" style={styles.retry}><Text style={[styles.copy, { color: colors.brand.accent }]}>허용 상태 다시 확인</Text></Pressable>}
      <Pressable disabled={opening} onPress={() => { void open(); }} accessibilityRole="button" accessibilityLabel="기기 알림 설정 열기" accessibilityState={{ disabled: opening }} style={[styles.button, { borderColor: colors.border.strong, opacity: opening ? 0.6 : 1 }]}><Text style={[styles.buttonText, { color: colors.text.primary }]}>{opening ? '설정을 여는 중…' : '기기 설정 열기'}</Text><Feather name="external-link" size={17} color={colors.text.primary} /></Pressable>
      {settingsError && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>설정을 열지 못했어요. 휴대폰 설정에서 Mirror Soul의 알림 항목을 찾아주세요.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg, gap: Spacing.sm },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 28 },
  status: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
  statusText: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  button: { borderWidth: 1, borderRadius: Radii.md, minHeight: 48, padding: Spacing.md, flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
  buttonText: { flexShrink: 1, fontFamily: FontFamily.sans, fontWeight: FontWeight.medium, fontSize: FontSize.base, lineHeight: 23 },
  retry: { minHeight: 48, justifyContent: 'center' },
});
