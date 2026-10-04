import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioModule } from 'expo-audio';
import type { PermissionResponse } from 'expo-modules-core';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';

export function MicrophonePermission() {
  const { colors } = useThemeColors();
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [settingsError, setSettingsError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; generation.current += 1; };
  }, []);

  const check = useCallback(async () => {
    const attempt = ++generation.current;
    setChecking(true);
    try {
      const next = await AudioModule.getRecordingPermissionsAsync();
      if (generation.current === attempt) {
        setPermission(next);
        setPermissionError(false);
      }
    } catch {
      if (generation.current === attempt) setPermissionError(true);
    } finally {
      if (generation.current === attempt) setChecking(false);
    }
  }, []);
  useProfileRefresh(check);

  const request = async () => {
    if (lock.current || !permission?.canAskAgain) return;
    lock.current = true;
    setBusy(true);
    const attempt = ++generation.current;
    try {
      const next = await AudioModule.requestRecordingPermissionsAsync();
      if (generation.current === attempt) {
        setPermission(next);
        setPermissionError(false);
      }
    } catch {
      if (generation.current === attempt) setPermissionError(true);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  };

  // 이미 허용했거나 다시 요청할 수 없는 경우에도 OS 설정에서 변경할 수 있다.
  const openSettings = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setSettingsError(false);
    try {
      await Linking.openSettings();
    } catch {
      if (alive.current) setSettingsError(true);
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  };

  const disabled = busy || checking;
  const buttonStyle = [styles.button, { borderColor: colors.border.primary, opacity: disabled ? 0.5 : 1 }];
  return (
    <View style={styles.content}>
      <Text accessibilityLiveRegion="polite" style={[styles.copy, { color: colors.text.secondary }]}>
        {checking ? '마이크 사용 권한을 확인하고 있어요.' : permission?.granted ? '마이크 사용이 허용되어 있어요.' : '통화에서 내 목소리를 전달하려면 마이크 사용을 허용해 주세요.'}
      </Text>
      {permissionError && (
        <>
          <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>마이크 권한을 확인하지 못했어요.</Text>
          <Pressable disabled={disabled} onPress={() => { void check(); }} accessibilityRole="button" accessibilityLabel="마이크 권한 다시 확인" accessibilityState={{ disabled }} style={buttonStyle}>
            <Text style={[styles.copy, { color: colors.brand.accent }]}>다시 확인</Text>
          </Pressable>
        </>
      )}
      {!permissionError && permission && !permission.granted && permission.canAskAgain && (
        <Pressable disabled={disabled} onPress={() => { void request(); }} accessibilityRole="button" accessibilityLabel="마이크 사용 허용" accessibilityState={{ disabled }} style={buttonStyle}>
          <Text style={[styles.copy, { color: colors.brand.accent }]}>{busy ? '확인 중…' : '마이크 사용 허용'}</Text>
        </Pressable>
      )}
      <Text style={[styles.copy, { color: colors.text.muted }]}>
        {Platform.OS === 'ios' ? '기기 설정에서 마이크를 켜거나 끌 수 있어요.' : '기기 설정의 ‘권한 → 마이크’에서 허용 여부를 바꿀 수 있어요.'}
      </Text>
      <Pressable disabled={busy} onPress={() => { void openSettings(); }} accessibilityRole="button" accessibilityLabel="마이크 설정 열기" accessibilityState={{ disabled: busy }} style={[styles.button, { borderColor: colors.border.primary, opacity: busy ? 0.5 : 1 }]}>
        <Text style={[styles.copy, { color: colors.brand.accent }]}>기기 설정 열기</Text>
      </Pressable>
      {settingsError && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>기기 설정을 열지 못했어요. 휴대폰 설정에서 Mirror Soul을 찾아주세요.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.md },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21 },
  button: { minHeight: 48, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
});
