import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PartnerProfileModal from '@/src/components/home/main/Discovery/PartnerProfileModal';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useIntroductionQuery } from '../hooks/useIntroductionQuery';
import { toPublicProfilePreview } from './toPublicProfile';

export function PublicProfilePreview({ onClose }: { onClose: () => void }) {
  const query = useIntroductionQuery();
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const preview = useMemo(() => query.data && !query.isPreview ? toPublicProfilePreview(query.data) : null, [query.data, query.isPreview]);
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      {preview ? <PartnerProfileModal match={preview.match} ownPreview embedded previewDetail={preview.detail} onClose={onClose} /> :
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>내 프로필 미리보기</Text>
        {query.isLoading ? <ActivityIndicator color={colors.brand.accent} /> : <>
          <Text style={{ color: colors.text.secondary }}>공개 프로필을 불러오지 못했어요.</Text>
          <Pressable onPress={() => query.refetch()} accessibilityRole="button" style={styles.button}><Text style={{ color: colors.brand.accent }}>다시 시도</Text></Pressable>
        </>}
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.button}><Text style={{ color: colors.text.primary }}>닫기</Text></Pressable>
      </View>}
    </Modal>
  );
}
const styles = StyleSheet.create({ root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }, title: { fontSize: 20, fontWeight: '700' }, button: { padding: 16, minHeight: 44 } });
