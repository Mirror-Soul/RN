import { BrowseIcon } from '@/src/components/home/common/BrowseIcon';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { MatchActionButton } from '@/src/features/match/components/MatchActionButton';
import CallStartConfirmSheet, { CallTarget } from '@/src/components/call/CallStartConfirmSheet';
import { TimeRefillBottomSheet } from '@/src/features/profile/components/TimeRefillBottomSheet';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useRecommendationDetailQuery } from '@/src/features/home/hooks/useRecommendationDetailQuery';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { formatRegion } from '@/src/utils/formatRegion';
import { VoicePreviewPlayer } from '@/src/features/profile/components/VoicePreviewPlayer';
import { ProfileJobBadge } from '@/src/features/profile/components/ProfileJobBadge';
import { MbtiBalance } from './MbtiBalance';
import { ProfilePhotoImage } from '@/src/features/profile/photo/ProfilePhotoImage';
import { DetailPhotoOverlay } from '@/src/features/profile/photo/ProfilePhotoOverlays';
import { PROFILE_PHOTO_ASPECT, PROFILE_PHOTO_MAX_WIDTH } from '@/src/features/profile/photo/profilePhotoPresentation';
import { getMockRecommendationDetail, isMockRecommendationUuid } from './mockRecommendations';
import type { Recommendation, RecommendationDetailResult } from '@/src/types/api/home';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PartnerProfileModalProps {
  source?: 'recommendation' | 'history';
  match: Recommendation | null;
  onClose: () => void;
  /** 닫힘 애니메이션 완료 뒤 호출 — 다음 native Modal을 이어 열 때 전환 겹침을 막는다. */
  onDismiss?: () => void;
  onStartCall?: (target: CallTarget, isPreview: boolean, remainingSeconds?: number) => void;
  /** 본인 데이터로 공개 레이아웃만 보여준다. 추천 API 조회/통화 버튼은 제공하지 않는다. */
  previewDetail?: RecommendationDetailResult;
  ownPreview?: boolean;
  previewImageUri?: string | null;
  onPreviewReload?: () => Promise<unknown>;
  isPreviewReloading?: boolean;
  /** 이미 열린 미리보기 Modal 안에서 표시할 때 native Modal을 중첩하지 않는다. */
  embedded?: boolean;
}

/**
 * PartnerProfileModal 컴포넌트 (SRP)
 * 상대 소울의 상세 프로필을 보여주는 전체 화면 바텀시트입니다.
 * SelectDropdownModal.tsx와 동일한 Modal(transparent)+Animated.View 진입 애니메이션 패턴을
 * 세로 슬라이드(하단→전체 화면)로 응용합니다.
 */
export default function PartnerProfileModal({ match, onClose, onDismiss, onStartCall, previewDetail, ownPreview = false, embedded = false, previewImageUri, onPreviewReload, isPreviewReloading = false, source = 'recommendation' }: PartnerProfileModalProps) {
  const { colors } = useThemeColors();
  const { palette } = useMatchingDesign();
  const insets = useSafeAreaInsets();
  const { height, fontScale } = useWindowDimensions();
  const { contentContainerStyle, contentWidth } = useLayout();
  const inlineAction = height < 500 || fontScale > 1.5;
  // Keep the agreed 4:5 crop while avoiding an oversized photo on tablets.
  const photoWidth = Math.min(PROFILE_PHOTO_MAX_WIDTH, Math.max(0, contentWidth - insets.left - insets.right - 32), Math.max(0, height - insets.top - insets.bottom) * 0.65 * PROFILE_PHOTO_ASPECT);
  const progress = useRef(new Animated.Value(0)).current;
  const [imageFailed, setImageFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const imageIdentity = useRef('');
  // match가 null이 되어도 닫힘 애니메이션이 끝날 때까지 마지막 match를 계속 렌더링하기 위한 상태
  const [displayedMatch, setDisplayedMatch] = useState<Recommendation | null>(null);
  const [activeSheet, setActiveSheet] = useState<'call' | 'refill' | null>(null);
  useEffect(() => { setActiveSheet(null); }, [match?.userUuid]);
  const closeTopLayer = () => {
    if (activeSheet) setActiveSheet(null);
    else onClose();
  };
  // displayedMatch(닫힘 애니메이션 동안에도 유지되는 값)를 키로 써야, match prop이 먼저 null이
  // 되어도 애니메이션이 끝나기 전에 상세 전용 섹션이 먼저 비어버리지 않는다.
  // 목업 UUID는 백엔드 UUID가 아니며 실제 추천 노출 이력도 없다. 따라서 API 요청을 완전히
  // 건너뛰고, 실제 상세 API 응답과 같은 타입의 fixture로 UI를 렌더링한다.
  const displayedUserUuid = displayedMatch?.userUuid;
  const isMockMatch = isMockRecommendationUuid(displayedUserUuid);
  const mockDetail = getMockRecommendationDetail(displayedUserUuid);
  const {
    data: apiDetail,
    error: detailError,
    isError: isDetailError,
    isFetching: isDetailFetching,
    refetch: refetchDetail,
  } = useRecommendationDetailQuery(ownPreview || isMockMatch ? null : (displayedUserUuid ?? null));
  const detail = ownPreview ? previewDetail : (mockDetail ?? apiDetail);

  useEffect(() => { setImageFailed(false); setPreviewFailed(false); }, [displayedMatch?.profileImageUrl, detail?.profileImageUrl, previewImageUri]);

  useEffect(() => {
    if (match) {
      setDisplayedMatch(match);
      setImageFailed(false);
      Animated.timing(progress, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (displayedMatch) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayedMatch(null);
          onDismiss?.();
        }
      });
    }
    // 부모가 이 컴포넌트를 애니메이션 도중 강제로 언마운트하는 경우, 진행 중인 타이밍을
    // 정리하지 않으면 언마운트된 컴포넌트의 상태를 세팅하려는 콜백이 뒤늦게 실행될 수 있다.
    return () => {
      progress.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, progress]);

  if (!displayedMatch) return null;

  // 목록은 모달을 즉시 열기 위한 스냅샷이고, 상세 응답이 도착하면 그것을 정본으로 사용한다.
  // 단, 상세 API가 null을 명시한 필드는 목록의 오래된 값으로 되살리지 않고 빈 상태를 보여준다.
  const profileName = detail?.name ?? displayedMatch.name;
  const profileAge = detail ? detail.age : displayedMatch.age;
  const profileImageUrl = detail ? detail.profileImageUrl : displayedMatch.profileImageUrl;
  const photoUri = imageFailed && ownPreview && previewImageUri && !previewFailed ? previewImageUri : profileImageUrl;
  const imageKey = `${displayedUserUuid}:${photoUri}:${imageAttempt}`;
  imageIdentity.current = imageKey;
  const showPhoto = !!photoUri && (!imageFailed || photoUri === previewImageUri);
  const refreshProfile = ownPreview ? onPreviewReload : isMockMatch ? undefined : () => refetchDetail({ throwOnError: true });
  const refreshing = ownPreview ? isPreviewReloading : isDetailFetching;
  const retryPhoto = () => {
    setImageAttempt(value => value + 1);
    setImageFailed(false);
    setPreviewFailed(false);
    void refreshProfile?.().catch(() => {});
  };
  const profileRegion = detail ? detail.region : displayedMatch.residence;
  const profileJob = detail ? detail.job : displayedMatch.job;
  const profileMbti = detail ? detail.mbti : displayedMatch.mbti;
  const hasMbtiScores = !!detail?.mbtiAxisScores && Object.values(detail.mbtiAxisScores).some(Number.isFinite);
  const profileIntroduction = detail ? detail.selfIntroduction : displayedMatch.selfIntroduction;
  const personalityTags = detail ? detail.personalityTags : displayedMatch.personalityTags;
  const isRecommendationUnavailable = getErrorCode(detailError) === 'RECOMMENDATION_TARGET_NOT_FOUND';
  const detailErrorMessage = isRecommendationUnavailable
    ? source === 'history' ? '현재 이 사용자의 상세 프로필을 확인할 수 없어요.' : '이 추천은 더 이상 상세 정보를 확인할 수 없어요.'
    : getErrorDisplayMessage(detailError, '상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');


  const callFooter = ownPreview ? null : <View style={[contentContainerStyle, styles.callFooter, { paddingBottom: Math.max(insets.bottom, Spacing.md), borderTopColor: colors.border.primary, backgroundColor: colors.background.primary }]}>
    <MatchActionButton label={isRecommendationUnavailable ? '통화할 수 없어요' : '트윈과 통화하기'}
      primary icon={color => <BrowseIcon name="phone-call" color={color} />} disabled={isRecommendationUnavailable || !onStartCall} onPress={() => setActiveSheet('call')} />
  </View>;
  return (
    <ProfileModalContainer embedded={embedded} onClose={closeTopLayer}>
      <View style={styles.container}>
      <Animated.View accessibilityElementsHidden={activeSheet !== null} importantForAccessibility={activeSheet ? 'no-hide-descendants' : 'auto'} style={[styles.container, { backgroundColor: colors.background.primary, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right,
        transform: [{ translateY: embedded ? 0 : progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }] }]}>
        <View style={[contentContainerStyle, styles.header]}>
          <Text variant="heading" accessibilityRole="header" style={[styles.headerTitle, { color: colors.text.primary }]}>{ownPreview ? '내 프로필 미리보기' : source === 'history' ? '사용자 상세' : '추천 프로필'}</Text>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" style={styles.close}>
            <Feather name="x" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scroll} automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never"
          showsVerticalScrollIndicator={false} contentContainerStyle={[contentContainerStyle, { paddingBottom: ownPreview ? Math.max(insets.bottom, Spacing.lg) : 0 }]}>
          <View style={[styles.hero, { width: photoWidth }]}>
            {showPhoto ? <ProfilePhotoImage key={imageKey} source={{ uri: photoUri! }} style={StyleSheet.absoluteFill}
              cachePolicy="disk" transition={150}
              onError={() => { if (imageIdentity.current !== imageKey) return; if (photoUri === previewImageUri) setPreviewFailed(true); else setImageFailed(true); }} />
              : <View style={styles.fallback} accessible accessibilityLabel={profileImageUrl ? '사진을 불러올 수 없습니다' : '프로필 사진이 없습니다'}>
                <BrowseIcon name="user-circle" size={48} color={Colors.neutral.softWhite} />
              </View>}
            <DetailPhotoOverlay name={profileName} width={photoWidth} height={photoWidth / PROFILE_PHOTO_ASPECT} />
          </View>
          <View style={styles.content}>
            {ownPreview && <Text style={[styles.caption, { color: colors.text.secondary }]}>상대에게 보이는 내 프로필이에요.</Text>}
            <View style={styles.identity}>
              <View style={styles.metaRow}>
                {profileAge != null && <Text style={[styles.metaText, { color: colors.text.secondary }]}>{profileAge}세</Text>}
                <Text style={[styles.metaText, { color: colors.text.secondary }]}>{profileRegion ? formatRegion(profileRegion) : detail ? '활동 지역 미설정' : '활동 지역 확인 중'}</Text>
                {profileJob && <ProfileJobBadge job={profileJob} />}
              </View>
            </View>
            {!showPhoto && !profileImageUrl && <Text style={[styles.caption, { color: colors.text.secondary }]}>프로필 사진은 아직 등록하지 않았어요.</Text>}
            {imageFailed && profileImageUrl && <View style={styles.section}>
              <Text style={[styles.caption, { color: colors.text.secondary }]}>{showPhoto ? '방금 등록한 사진을 보여드리고 있어요. 서버 사진은 다시 확인해주세요.' : '사진을 불러오지 못했어요.'}</Text>
              <TouchableOpacity onPress={retryPhoto} disabled={refreshing} accessibilityRole="button" accessibilityLabel="프로필 사진 다시 불러오기" style={styles.retry}>
                <Text style={[styles.copy, { color: palette.accentInk }]}>사진 다시 불러오기</Text>
              </TouchableOpacity>
            </View>}
            {isDetailError && !isMockMatch && !ownPreview ? <DetailLoadError message={detailErrorMessage} unavailable={isRecommendationUnavailable} returnLabel={source === 'history' ? '통화 기록으로 돌아가기' : '추천 목록으로 돌아가기'}
              isRetrying={isDetailFetching} onClose={onClose} onRetry={() => refetchDetail()} /> : <>
              <Section title="소개" index={0}>
                <Text style={[styles.bioText, { color: colors.text.secondary }]}>{profileIntroduction || (detail ? '아직 등록한 소개가 없어요.' : '소개를 불러오고 있어요.')}</Text>
              </Section>
              <Section title="목소리 미리듣기" index={1}>
                <View style={[styles.voiceCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
                  {detail?.voicePreview ? <VoicePreviewPlayer key={detail.voicePreview.audioUrl} voicePreview={detail.voicePreview} suspended={activeSheet !== null || !match} isReloading={refreshing} onReload={refreshProfile} />
                    : detail ? <View style={styles.section}>
                      <Text style={[styles.copy, { color: colors.text.secondary }]}>아직 재생할 수 있는 미리듣기 음성이 없어요.</Text>
                      {refreshProfile && <TouchableOpacity onPress={() => { void refreshProfile().catch(() => {}); }} disabled={refreshing} accessibilityRole="button" accessibilityLabel="음성 미리듣기 다시 확인" style={styles.retry}>
                        <Text style={[styles.copy, { color: palette.accentInk }]}>다시 확인</Text>
                      </TouchableOpacity>}
                    </View> : <ActivityIndicator color={colors.text.secondary} />}
                </View>
              </Section>
              {(detail?.syncRate != null || personalityTags.length > 0) && <Section title="트윈의 성향" index={2}>
                {detail?.syncRate != null && <Text style={[styles.copy, { color: colors.text.secondary }]}>트윈 싱크로율 {detail.syncRate}%</Text>}
                {personalityTags.length > 0 && <View style={styles.tags}>
                  {personalityTags.map((tag, index) => <View key={`${index}:${tag}`} style={[styles.tag, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                    <Text style={[styles.caption, { color: colors.text.secondary }]}>{tag}</Text>
                  </View>)}
                </View>}
              </Section>}
              {(profileMbti || hasMbtiScores) && <Section title={hasMbtiScores ? 'MBTI 성향 밸런스' : 'MBTI'} index={3}
                accessory={profileMbti ? <View style={[styles.mbti, { backgroundColor: palette.coolTint }]}>
                  <Text style={[styles.caption, { color: palette.cyanInk }]}>{profileMbti}</Text>
                </View> : undefined}>
                {hasMbtiScores && <MbtiBalance scores={detail!.mbtiAxisScores!} />}
              </Section>}
            </>}
          </View>
          {inlineAction && callFooter}
        </ScrollView>
        {!inlineAction && callFooter}
      </Animated.View>
      {activeSheet === 'call' && <CallStartConfirmSheet embedded target={{ userUuid: displayedMatch.userUuid, name: profileName }} isOpen
        onClose={() => setActiveSheet(null)} onRefill={() => setActiveSheet('refill')}
        onStart={(target, isPreview, remainingSeconds) => { setActiveSheet(null); onStartCall?.(target, isPreview, remainingSeconds); }} />}
      {activeSheet === 'refill' && <TimeRefillBottomSheet embedded isOpen onClose={() => setActiveSheet(null)} />}
      </View>
    </ProfileModalContainer>
  );
}

function ProfileModalContainer({ embedded, onClose, children }: { embedded: boolean; onClose: () => void; children: React.ReactNode }) {
  return embedded ? <>{children}</> : <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>{children}</Modal>;
}

function DetailLoadError({
  message,
  unavailable,
  isRetrying,
  onClose,
  onRetry,
  returnLabel,
}: {
  message: string;
  unavailable: boolean;
  isRetrying: boolean;
  onClose: () => void;
  onRetry: () => void;
  returnLabel: string;
}) {
  const { colors } = useThemeColors();
  const actionLabel = unavailable ? returnLabel : '다시 시도';

  return (
    <View style={[styles.detailErrorCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <Feather name="alert-circle" size={25} color={colors.text.muted} />
      <Text style={[styles.detailErrorTitle, { color: colors.text.primary }]}>상세 정보를 불러오지 못했어요</Text>
      <Text style={[styles.detailErrorMessage, { color: colors.text.muted }]}>{message}</Text>
      <TouchableOpacity
        onPress={unavailable ? onClose : onRetry}
        disabled={!unavailable && isRetrying}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        style={[styles.detailErrorAction, { borderColor: colors.border.primary }]}
      >
        {!unavailable && isRetrying ? <ActivityIndicator size="small" color={Colors.primary.electricCyan} /> : null}
        <Text style={[styles.detailErrorActionText, { color: colors.text.primary }]}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Section({ title, index, children, accessory }: { title: string; index: number; children: React.ReactNode; accessory?: React.ReactNode }) {
  const { colors } = useThemeColors();

  return (
    <ReAnimated.View entering={FadeInUp.delay(index * 60).duration(400)}>
      <View style={styles.sectionHeading}>
        <Text variant="heading" accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
        {accessory}
      </View>
      {children}
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingLeft: Spacing.xl, paddingRight: Spacing.sm, paddingVertical: Spacing.xs },
  headerTitle: { flex: 1, minWidth: 0, fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24 },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  hero: { aspectRatio: PROFILE_PHOTO_ASPECT, alignSelf: 'center', backgroundColor: Colors.primary.cardBlack, borderRadius: Radii.lg, overflow: 'hidden' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  identity: { gap: Spacing.sm },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'center' },
  metaText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23 },
  mbti: { alignSelf: 'flex-start', maxWidth: '100%', borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  section: { gap: Spacing.sm },
  sectionHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionTitle: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 24 },
  bioText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 24 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23 },
  caption: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  tag: { maxWidth: '100%', borderWidth: StyleSheet.hairlineWidth, borderRadius: Radii.sm, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  voiceCard: { padding: Spacing.md, borderWidth: 1, borderRadius: Radii.lg },
  retry: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: Spacing.sm },
  detailErrorCard: { borderWidth: 1, borderRadius: Radii.lg, padding: Spacing.lg, gap: Spacing.md, alignItems: 'center' },
  detailErrorTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 25, textAlign: 'center' },
  detailErrorMessage: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23, textAlign: 'center' },
  detailErrorAction: { minHeight: 48, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  detailErrorActionText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 23 },
  callFooter: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, flexShrink: 0 },
});
