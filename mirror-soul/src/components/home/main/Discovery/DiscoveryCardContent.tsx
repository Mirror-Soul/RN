import React, { useEffect, useRef, useState } from 'react';
import { useRetryableProfileImage } from '@/src/features/profile/photo/useRetryableProfileImage';
import { sameProfileImageObject, shouldRefreshProfileImage } from '@/src/features/profile/photo/profileImageUrl';
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { ProfilePhotoImage } from '@/src/features/profile/photo/ProfilePhotoImage';
import { CardPhotoOverlay } from '@/src/features/profile/photo/ProfilePhotoOverlays';
import { RECOMMENDATION_PHOTO_ASPECT } from '@/src/features/profile/photo/profilePhotoPresentation';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { formatRegion } from '@/src/utils/formatRegion';
import { ProfileJobBadge } from '@/src/features/profile/components/ProfileJobBadge';
import { MatchActionButton } from '@/src/features/match/components/MatchActionButton';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import type { Recommendation } from '@/src/types/api/home';

interface DiscoveryCardContentProps {
  match: Recommendation;
  showPhotoOverlays?: boolean;
  summaryExpandable?: boolean;
  onPhotoPress?: () => void;
  onContentPress?: () => void;
  onConnectPress?: () => void;
  onReloadPhoto?: () => Promise<unknown>;
}

/** Photo, identity, introduction, then explicit actions; each action owns its touch area. */
export default function DiscoveryCardContent({
  match, showPhotoOverlays = false, summaryExpandable = false,
  onPhotoPress, onContentPress, onConnectPress,
  onReloadPhoto,
}: DiscoveryCardContentProps) {
  const { colors } = useThemeColors();
  const { palette } = useMatchingDesign();
  const { cardWidth } = useLayout();
  const { fontScale } = useWindowDimensions();
  const [actionWidth, setActionWidth] = useState(cardWidth - Spacing.lg * 2);
  const photo = useRetryableProfileImage(match.profileImageUrl, onReloadPhoto);
  const { failed: photoFailed, retry: retryPhoto } = photo;
  const autoRecovery = useRef<{ userUuid: string; uri: string } | null>(null);
  useEffect(() => {
    const uri = match.profileImageUrl;
    if (!photoFailed || !uri || !onReloadPhoto || !shouldRefreshProfileImage(uri)) return;
    if (autoRecovery.current?.userUuid === match.userUuid && sameProfileImageObject(autoRecovery.current.uri, uri)) return;
    autoRecovery.current = { userUuid: match.userUuid, uri };
    void retryPhoto();
  }, [match.userUuid, match.profileImageUrl, onReloadPhoto, photoFailed, retryPhoto]);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  useEffect(() => { setExpanded(false); setTruncated(false); }, [match.userUuid, match.selfIntroduction]);
  const photoAvailable = !!match.profileImageUrl && !photo.failed;
  const summary = match.selfIntroduction?.trim();
  const stacked = actionWidth < 300 || fontScale > 1.3;
  const photoAction = photoAvailable ? onPhotoPress : onContentPress;
  return <>
    <TouchableOpacity
      style={styles.photoBox} onPress={photoAction} disabled={!photoAction} activeOpacity={0.95}
      accessibilityRole="button" accessibilityLabel={photoAvailable ? '프로필 사진 크게 보기' : '상세 프로필 보기'}
    >
      {photoAvailable ? <ProfilePhotoImage
        key={photo.imageKey} source={{ uri: match.profileImageUrl! }} style={StyleSheet.absoluteFill}
        cachePolicy="disk" transition={150} onError={photo.onError}
      /> : <View style={styles.fallback}>
        <View style={styles.avatar}><BrowseIcon name="user-circle" size={32} color={Colors.neutral.softWhite} /></View>
        <Text style={styles.fallbackText}>{match.profileImageUrl ? '사진을 불러오지 못했어요' : '사진 없이 먼저 만나보세요'}</Text>
      </View>}
      {showPhotoOverlays && photoAvailable && <CardPhotoOverlay />}
    </TouchableOpacity>
    {photo.failed && <TouchableOpacity accessibilityRole="button" accessibilityLabel="추천 프로필 사진 다시 불러오기"
      disabled={photo.isReloading} accessibilityState={{ busy: photo.isReloading }} onPress={() => { void photo.retry(); }}
      style={[styles.more, { alignSelf: 'center' }]}>
      <Text style={[styles.caption, { color: palette.accentInk }]}>{photo.isReloading ? '사진을 다시 확인하고 있어요…' : '사진 다시 불러오기'}</Text>
    </TouchableOpacity>}

    <View style={styles.content}>
      <TouchableOpacity onPress={onContentPress} disabled={!onContentPress} activeOpacity={0.8}
        accessibilityRole="button" accessibilityLabel={`${match.name}님의 상세 프로필 보기`} style={styles.identity}>
        <View style={styles.nameRow}>
          <Text variant="heading" style={[styles.name, { color: colors.text.primary }]}>{match.name}</Text>
          {match.age != null && <Text style={[styles.age, { color: colors.text.secondary }]}>{match.age}세</Text>}
        </View>
        {showPhotoOverlays && Number.isFinite(match.recommendationScore) && <View style={[styles.score, { backgroundColor: palette.coolTint }]}>
          <BrowseIcon name="sparkle" size={13} color={palette.cyanInk} />
          <Text style={[styles.caption, { color: palette.cyanInk }]}>추천 점수 {match.recommendationScore}%</Text>
        </View>}
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.text.secondary }]}>{match.residence ? formatRegion(match.residence) : '활동 지역 미설정'}</Text>
          {match.job && <ProfileJobBadge job={match.job} />}
        </View>
      </TouchableOpacity>

      {summary && <View>
        <Text style={[styles.summary, { color: colors.text.secondary }]} numberOfLines={summaryExpandable && expanded ? undefined : 2}>{summary}</Text>
        {summaryExpandable && <Text style={[styles.summary, styles.measure]} accessible={false} accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants" pointerEvents="none"
          onTextLayout={event => setTruncated(event.nativeEvent.lines.length > 2)}>{summary}</Text>}
        {summaryExpandable && truncated && <TouchableOpacity onPress={() => setExpanded(value => !value)} style={styles.more}
          accessibilityRole="button" accessibilityLabel={expanded ? '자기소개 접기' : '자기소개 전체 보기'}
          accessibilityState={{ expanded }}>
          <Text style={[styles.caption, { color: palette.accentInk }]}>{expanded ? '접기' : '더보기'}</Text>
        </TouchableOpacity>}
      </View>}

      {(match.mbti || match.personalityTags.length > 0) && <View style={styles.tags}>
        {[...(match.mbti ? [match.mbti] : []), ...match.personalityTags.slice(0, 2)].map((tag, index) =>
          <View key={`${index}:${tag}`} style={[styles.tag, { backgroundColor: index === 0 && match.mbti ? palette.coolTint : colors.background.glass,
              borderColor: index === 0 && match.mbti ? 'transparent' : colors.border.primary }]}>
            <Text style={[styles.caption, { color: index === 0 && match.mbti ? palette.cyanInk : colors.text.secondary }]}>{tag}</Text>
          </View>)}
      </View>}

      {(onContentPress || onConnectPress) && <View onLayout={event => setActionWidth(event.nativeEvent.layout.width)}
        style={[styles.actions, stacked && styles.stacked]}>
        {onContentPress && <View style={!stacked && styles.secondaryAction}>
          <MatchActionButton label="프로필 보기" onPress={onContentPress} icon={color => <BrowseIcon name="user-circle" color={color} />} />
        </View>}
        {onConnectPress && <View style={!stacked && styles.primaryAction}>
          <MatchActionButton label="트윈과 통화" onPress={onConnectPress} primary icon={color => <BrowseIcon name="phone-call" color={color} />} />
        </View>}
      </View>}
    </View>
  </>;
}

const styles = StyleSheet.create({
  photoBox: { width: '100%', aspectRatio: RECOMMENDATION_PHOTO_ASPECT, borderRadius: Radii.lg, overflow: 'hidden', backgroundColor: Colors.primary.cardBlack },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.glass.white10 },
  fallbackText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, color: Colors.neutral.softWhite, textAlign: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.md },
  identity: { gap: Spacing.xs },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: Spacing.sm },
  name: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.medium, lineHeight: 29, letterSpacing: -0.2 },
  age: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: Spacing.sm, rowGap: Spacing.xs },
  meta: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  score: { alignSelf: 'flex-start', maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs },
  caption: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.medium },
  summary: { fontFamily: FontFamily.sans, fontSize: FontSize.md, lineHeight: 24 },
  measure: { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 },
  more: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: Spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { maxWidth: '100%', borderWidth: StyleSheet.hairlineWidth, borderRadius: Radii.sm, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  stacked: { flexDirection: 'column' },
  secondaryAction: { flex: 1, minWidth: 0 },
  primaryAction: { flex: 1.3, minWidth: 0 },
});
