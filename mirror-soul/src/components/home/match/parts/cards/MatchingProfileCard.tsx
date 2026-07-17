import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Badge } from '@/src/components/common/Badge';
import Animated, { SharedValue } from 'react-native-reanimated';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useCarousel } from '@/src/animations/scroll/useCarousel';
import MatchingFooter from '@/src/components/home/match/parts/MatchingFooter';

interface MatchingProfileCardProps {
  data: {
    id: string;
    name: string;
    age: number;
    timeAgo: string;
    satisfaction: number;
    tags: string[];
    message: string;
    summaries: string[];
  };
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
}

export default function MatchingProfileCard({ data, index, scrollX, itemWidth }: MatchingProfileCardProps) {
  const { colors, isDark } = useThemeColors();
  
  // 중앙화된 애니메이션 훅 사용 (로직 깔끔하게 분리)
  const { animatedStyle } = useCarousel({ scrollX, index, itemWidth });

  return (
    <Animated.View style={[{ width: '100%' }, animatedStyle]}>
      <View style={[styles.outerContainer, { borderColor: colors.border.primary }]}>
        <LinearGradient
        colors={[colors.background.glass, 'rgba(0, 0, 0, 0)']} // ThemeColors에서 관리
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* 상단: 프로필 및 매칭 지수 */}
        <View style={[styles.topSection, { borderBottomColor: colors.border.primary }]}>
          <View style={styles.profileRow}>
            <View style={styles.profileLeft}>
              {/* 이미지 플레이스홀더 */}
              <LinearGradient
                colors={Colors.gradient.avatarPlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.avatarPlaceholder, { borderColor: colors.border.primary }]}
              >
                <Text style={styles.avatarText}>{data.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              
              <View style={styles.profileInfo}>
                <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
                  {data.name}, {data.age}
                </Text>
                <View style={styles.timeRow}>
                  <Feather name="clock" size={12} color={Colors.primary.electricCyan} />
                  <Text style={styles.timeText}>{data.timeAgo}</Text>
                </View>
              </View>
            </View>

            <View style={styles.satisfactionBox}>
              <Text style={styles.satisfactionLabel} numberOfLines={1} adjustsFontSizeToFit>MIRROR SATISFACTION</Text>
              <Text style={styles.satisfactionValue}>{data.satisfaction}%</Text>
            </View>
          </View>

          {/* 태그 리스트 */}
          <View style={styles.tagRow}>
            {data.tags.map((tag, i) => (
              <Badge key={i} label={`# ${tag}`} variant="glass" colorScheme="gray" size="sm" textStyle={styles.tagText} />
            ))}
          </View>
        </View>

        {/* 하단: 레조넌스 요약 및 메시지 */}
        <View style={styles.bottomSection}>
          {/* 내부 Blur 장식 */}
          <View style={[styles.innerBlur, { backgroundColor: colors.glow.cyanInner }]} />

          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={14} color={colors.text.muted} />
            <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Invitation Message</Text>
          </View>
          <Text style={[styles.italicMessage, { color: colors.text.primary }]}>
            "{data.message}"
          </Text>

          <View style={[styles.sectionHeader, { marginTop: Spacing.xxxl }]}>
            <Ionicons name="options-outline" size={14} color={colors.text.muted} />
            <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>Twin Resonance Summary</Text>
          </View>
          <View style={styles.resonanceList}>
            {data.summaries.map((item, i) => (
              <View key={i} style={[styles.resonanceItem, { borderColor: colors.border.primary, backgroundColor: colors.background.glass }]}>
                <View style={styles.cyanDot} />
                <Text style={[styles.resonanceText, { color: colors.text.secondary }]}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.infoBox, { borderColor: colors.border.primary, backgroundColor: colors.background.glass }]}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary.electricCyan} style={{ marginTop: Spacing.xxs }} />
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              'Twin Call'을 통해 상대방의 디지털 트윈(AI)과 미리 대화하며 서로의 가치관을 확인할 수 있습니다.
            </Text>
          </View>
        </View>
      </LinearGradient>
      </View>
      
      {/* 푸터(액션 버튼)를 카드 컨테이너 내부에 배치하여 카드 길이에 동적으로 붙게 함 */}
      <MatchingFooter />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 40,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  cardGradient: {
    width: '100%',
  },
  topSection: {
    padding: Spacing.xxl, 
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md, 
    flexShrink: 1,
  },
  avatarPlaceholder: {
    width: 64, 
    height: 70, 
    borderRadius: Radii.xxl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 26,
    color: Colors.neutral.pureWhite, 
  },
  profileInfo: {
    gap: Spacing.xs,
    flexShrink: 1,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 22, 
    letterSpacing: -1.1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: 11,
    color: Colors.neutral.darkGray,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  satisfactionBox: {
    alignItems: 'flex-end',
    gap: Spacing.xxs,
    flexShrink: 0, 
    width: 140, 
  },
  satisfactionLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 9, 
    color: Colors.primary.electricCyan,
    opacity: 0.8,
    letterSpacing: 1.5, 
    textTransform: 'uppercase',
  },
  satisfactionValue: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 30,
    color: Colors.primary.electricCyan,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    flexWrap: 'wrap',
  },
  tagText: {
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  bottomSection: {
    padding: Spacing.xxl, 
    position: 'relative',
    overflow: 'hidden',
  },
  innerBlur: {
    position: 'absolute',
    width: 192,
    height: 192,
    right: Spacing.none,
    top: -95,
    borderRadius: Radii.full,
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    letterSpacing: 2.1,
    textTransform: 'uppercase',
  },
  italicMessage: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontWeight: FontWeight.medium,
    fontSize: FontSize.md, 
    lineHeight: 24,
  },
  resonanceList: {
    gap: Spacing.md,
  },
  resonanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  cyanDot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  resonanceText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: 13,
  },
  infoBox: {
    flexDirection: 'row',
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
