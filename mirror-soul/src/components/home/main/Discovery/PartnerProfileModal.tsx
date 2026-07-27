import CancelIcon from '@/assets/images/common/Cancel.svg';
import HeartIcon from '@/assets/images/common/main/Heart.svg';
import LocationIcon from '@/assets/images/common/Location.svg';
import VerifiedIcon from '@/assets/images/common/Verification_protect_icon.svg';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SoulMatch } from './DiscoveryMatchCard';

interface PartnerProfileModalProps {
  match: SoulMatch | null;
  onClose: () => void;
  onConnectNow?: (match: SoulMatch) => void;
}

/**
 * PartnerProfileModal 컴포넌트 (SRP)
 * 상대 소울의 상세 프로필을 보여주는 전체 화면 바텀시트입니다.
 * SelectDropdownModal.tsx와 동일한 Modal(transparent)+Animated.View 진입 애니메이션 패턴을
 * 세로 슬라이드(하단→전체 화면)로 응용합니다.
 */
export default function PartnerProfileModal({ match, onClose, onConnectNow }: PartnerProfileModalProps) {
  const { colors } = useThemeColors();
  const progress = useRef(new Animated.Value(0)).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  // match가 null이 되어도 닫힘 애니메이션이 끝날 때까지 마지막 match를 계속 렌더링하기 위한 상태
  const [displayedMatch, setDisplayedMatch] = useState<SoulMatch | null>(null);

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
          setIsPlaying(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, progress]);

  if (!displayedMatch) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background.primary },
          {
            transform: [
              {
                translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }),
              },
            ],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.hero}>
            {imageFailed ? (
              <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.heroImage}>
                <Text style={styles.heroImageFallbackText}>{displayedMatch.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            ) : (
              <Image
                source={{ uri: displayedMatch.profileImage }}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            )}
            <LinearGradient colors={['transparent', 'rgba(5,5,5,0.4)', '#050505']} style={StyleSheet.absoluteFill} />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <CancelIcon width={20} height={20} />
            </TouchableOpacity>

            <View style={styles.heroInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.compatBadge}>
                  <Text style={styles.compatBadgeText}>Similarity {displayedMatch.compatibility}%</Text>
                </View>
                <View style={styles.mbtiBadge}>
                  <Text style={styles.mbtiBadgeText}>{displayedMatch.mbti}</Text>
                </View>
              </View>
              <Text style={styles.nameText}>
                {displayedMatch.name}
                <Text style={styles.ageText}> {displayedMatch.age}</Text>
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <LocationIcon width={14} height={14} />
                  <Text style={styles.metaText}>{displayedMatch.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="briefcase" size={14} color={Colors.neutral.lightGray} />
                  <Text style={styles.metaText}>{displayedMatch.job}</Text>
                  {displayedMatch.isJobVerified ? <VerifiedIcon width={14} height={14} /> : null}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <Section title="AI Persona Scan" icon="cpu">
              <View style={styles.tagRow}>
                {displayedMatch.aiAnalysisTags.map((tag) => (
                  <View key={tag} style={styles.aiTag}>
                    <Text style={styles.aiTagText}># {tag}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Digital Voice">
              <View style={[styles.voiceCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => setIsPlaying((prev) => !prev)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? '일시정지' : '재생'}
                >
                  <Feather name={isPlaying ? 'pause' : 'play'} size={22} color={Colors.primary.soulBlack} />
                </TouchableOpacity>
                <Text style={[styles.voiceStyleText, { color: colors.text.primary }]}>{displayedMatch.voiceStyle}</Text>
              </View>
            </Section>

            <Section title="Soul Record">
              <View style={[styles.bioCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                <Text style={[styles.bioText, { color: colors.text.secondary }]}>&quot;{displayedMatch.bio}&quot;</Text>
              </View>
            </Section>

            <Section title="Interests">
              <View style={styles.interestGrid}>
                {displayedMatch.interests.map((item) => (
                  <View
                    key={item.label}
                    style={[styles.interestItem, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                  >
                    <View style={[styles.interestIconWrapper, { backgroundColor: colors.background.card }]}>
                      <Feather name="star" size={18} color={Colors.primary.electricCyan} />
                    </View>
                    <Text style={[styles.interestLabel, { color: colors.text.secondary }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Section>
          </View>
        </ScrollView>

        <View style={styles.floatingBar}>
          <TouchableOpacity
            style={[styles.iconAction, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
            // TODO: 관심 표시(찜) 기능 범위가 정해지면 실제 핸들러로 교체
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="관심 표시"
          >
            <Feather name="heart" size={22} color={colors.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.connectNowButton}
            onPress={() => onConnectNow?.(displayedMatch)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Connect Now"
          >
            <HeartIcon width={20} height={20} />
            <Text style={styles.connectNowText}>Connect Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconAction, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
            // TODO: 공유 기능 범위가 정해지면 실제 핸들러로 교체
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="공유"
          >
            <Feather name="share-2" size={22} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

function Section({ title, icon, children }: { title: string; icon?: keyof typeof Feather.glyphMap; children: React.ReactNode }) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{title}</Text>
        {icon ? <Feather name={icon} size={16} color={Colors.glass.cyan30_d3} /> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    height: 480,
    width: '100%',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageFallbackText: {
    fontFamily: FontFamily.sans,
    fontSize: 96,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.xxl,
    right: Spacing.xxl,
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    backgroundColor: Colors.glass.black40,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    position: 'absolute',
    left: Spacing.xxxl,
    right: Spacing.xxxl,
    bottom: Spacing.xxxl,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  compatBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.cyan20_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan30_d3,
  },
  compatBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.primary.electricCyan,
  },
  mbtiBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white5,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
  },
  mbtiBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.neutral.lightGray,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.giant,
    fontWeight: FontWeight.black,
    letterSpacing: -1.4,
    color: Colors.neutral.pureWhite,
    marginBottom: Spacing.sm,
  },
  ageText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    color: Colors.neutral.darkGray,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.neutral.lightGray,
  },
  content: {
    paddingHorizontal: Spacing.xxxl,
    paddingBottom: 160,
    gap: Spacing.giant,
  },
  section: {
    marginTop: Spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  aiTag: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  aiTagText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary.electricCyan,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceStyleText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  bioCard: {
    padding: Spacing.xxl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  bioText: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '47%',
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
  },
  interestIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing.giant,
  },
  iconAction: {
    width: 64,
    height: 64,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectNowButton: {
    flex: 1,
    height: 64,
    borderRadius: Radii.xxl,
    backgroundColor: Colors.primary.electricCyan,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  connectNowText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.primary.soulBlack,
  },
});
