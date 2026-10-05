import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { useVoiceAudioSettings } from './hooks/useVoiceAudioSettings';
import { AudioCheck } from './components/AudioCheck';
import { MicrophonePermission } from './components/MicrophonePermission';
import { useVoiceAudioStore, type CallVoiceGain } from '@/src/store/useVoiceAudioStore';

export const VoiceAudioScreen = () => {
  const router = useRouter();
  const { volume, handleVolumeChange, isLoading, isError, isSaving, refetch } = useVoiceAudioSettings();
  const { colors } = useThemeColors();
  const gain = useVoiceAudioStore(state => state.callVoiceGain);
  const setGain = useVoiceAudioStore(state => state.setCallVoiceGain);
  useProfileRefresh(useCallback(() => refetch(), [refetch]));
  const disabled = volume == null || isSaving;
  const card = [styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }];
  return <ScreenLayout withScroll>
    <Header title="통화 소리 설정" delay={0} onBackPress={() => router.canGoBack() ? router.back() : router.replace('/(main)/profile')} />
    <View style={styles.content}>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>내게 편한 소리로 대화해 보세요.</Text>
      <View style={card}>
        <View style={styles.heading}><Feather name="volume-2" size={20} color={colors.brand.accent} /><Text style={[styles.title, { color: colors.text.primary }]}>상대 목소리 크기</Text></View>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>통화와 프로필 미리듣기에 적용돼요. 내 마이크 소리에는 영향을 주지 않아요.</Text>
        {isLoading ? <ActivityIndicator color={colors.brand.accent} /> : volume != null && <View style={styles.volumeRow}>
          <Pressable disabled={disabled || volume <= 0} onPress={() => handleVolumeChange(volume - 10)} accessibilityRole="button" accessibilityLabel="목소리 크기 줄이기" style={[styles.step, { borderColor: colors.border.primary, opacity: disabled || volume <= 0 ? 0.4 : 1 }]}><Feather name="minus" size={20} color={colors.text.primary} /></Pressable>
          <Text accessibilityLiveRegion="polite" style={[styles.value, { color: colors.text.primary }]}>{volume === 0 ? '소리 끔' : `${volume}%`}</Text>
          <Pressable disabled={disabled || volume >= 100} onPress={() => handleVolumeChange(volume + 10)} accessibilityRole="button" accessibilityLabel="목소리 크기 키우기" style={[styles.step, { borderColor: colors.border.primary, opacity: disabled || volume >= 100 ? 0.4 : 1 }]}><Feather name="plus" size={20} color={colors.text.primary} /></Pressable>
        </View>}
        {isError && <View style={styles.error}><Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>소리 설정을 불러오지 못했어요.</Text><Pressable onPress={() => { void refetch(); }} accessibilityRole="button" accessibilityLabel="소리 설정 다시 불러오기" style={styles.retry}><Text style={[styles.copy, { color: colors.brand.accent }]}>다시 불러오기</Text></Pressable></View>}
        <View style={styles.presets}>
          {([{ value: 25, label: '작게' }, { value: 50, label: '보통' }, { value: 100, label: '크게' }] as const).map(option => <Pressable key={option.value} disabled={disabled} onPress={() => handleVolumeChange(option.value)} accessibilityRole="radio" accessibilityLabel={`목소리 ${option.label}`} accessibilityState={{ selected: volume === option.value, disabled }} style={[styles.preset, { borderColor: volume === option.value ? colors.brand.accent : colors.border.primary, backgroundColor: colors.background.glass, opacity: disabled ? 0.5 : 1 }]}><Text style={[styles.copy, { color: volume === option.value ? colors.brand.accent : colors.text.primary }]}>{option.label}</Text></Pressable>)}
        </View>
        {isSaving && <Text accessibilityLiveRegion="polite" style={[styles.copy, { color: colors.text.muted }]}>목소리 크기를 저장하고 있어요…</Text>}
      </View>
      <View style={card}>
        <View style={styles.heading}><Feather name="volume-1" size={20} color={colors.brand.accent} /><Text style={[styles.title, { color: colors.text.primary }]}>작은 통화 음성 키우기</Text></View>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>기기 볼륨을 올려도 트윈 목소리가 작다면 조금 더 키워보세요.</Text>
        <View style={styles.presets}>
          {([{ value: 1, label: '원래 크기' }, { value: 1.5, label: '1.5배' }, { value: 2, label: '2배' }] satisfies { value: CallVoiceGain; label: string }[]).map(option => <Pressable key={option.value} onPress={() => setGain(option.value)} accessibilityRole="radio" accessibilityLabel={`통화 음성 ${option.label}`} accessibilityState={{ selected: gain === option.value }} style={[styles.preset, { borderColor: gain === option.value ? colors.brand.accent : colors.border.primary, backgroundColor: colors.background.glass }]}><Text style={[styles.copy, { color: gain === option.value ? colors.brand.accent : colors.text.primary }]}>{option.label}</Text></Pressable>)}
        </View>
        <Text style={[styles.copy, { color: colors.text.muted }]}>이 기기의 통화에만 적용돼요. 소리가 거칠게 들리면 원래 크기로 바꿔주세요.</Text>
      </View>
      <View style={card}><View style={styles.heading}><Feather name="headphones" size={20} color={colors.brand.accent} /><Text style={[styles.title, { color: colors.text.primary }]}>소리 확인</Text></View><AudioCheck volume={volume} /></View>
      <View style={card}><View style={styles.heading}><Feather name="mic" size={20} color={colors.brand.accent} /><Text style={[styles.title, { color: colors.text.primary }]}>마이크 사용</Text></View><MicrophonePermission /></View>
    </View>
  </ScreenLayout>;
};

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  card: { borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.lg, gap: Spacing.md },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 25, fontWeight: FontWeight.semibold },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21, flexShrink: 1 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  value: { flex: 1, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: FontSize.xxl, lineHeight: 32, fontWeight: FontWeight.semibold },
  step: { minHeight: 48, minWidth: 48, borderWidth: 1, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  preset: { flex: 1, minWidth: 64, minHeight: 48, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
  error: { gap: Spacing.sm }, retry: { minHeight: 48, justifyContent: 'center' },
});
