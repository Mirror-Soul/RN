import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface CallDetailHeaderLeftProps {
  name: string;
  profileImageUrl?: string | null;
  /** 백엔드가 방향(내가 걸었는지/받았는지)까지 반영해 만들어주는 요약 문구. 예: "수빈의 Twin과 대화" */
  description: string;
  /** 이 상대와 몇 번째 통화인지. null/undefined면 숨김. */
  callNumber?: number | null;
}

/**
 * 통화 상세 헤더 좌측 슬롯 — 아바타 + 통화 맥락 요약 + 통화 회차.
 * MessageRoomHeaderLeft.tsx와 동일한 구조(공용 Header의 leftContent로 전달).
 *
 * 트윈 정확도(twinSyncRate)는 여기서 표시하지 않는다 — CallDetailAlert 배너가 이미 같은 수치를
 * 문장으로 설명하고 있어서, 헤더에도 중복으로 넣지 않고 배너 한 곳에만 두기로 정리했다.
 */
export default function CallDetailHeaderLeft({
  name,
  profileImageUrl,
  description,
  callNumber,
}: CallDetailHeaderLeftProps) {
  const { colors } = useThemeColors();
  const hasCallNumber = callNumber != null;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={Colors.gradient.twinCallButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarInitial}>{name[0]}</Text>
          </LinearGradient>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
          {description}
        </Text>
        {hasCallNumber && (
          <Text style={[styles.metaText, { color: colors.text.muted }]}>{callNumber}번째 통화</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
    color: Colors.neutral.pureWhite,
  },
  info: {
    flex: 1,
    gap: Spacing.xxs,
  },
  name: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
  },
});
