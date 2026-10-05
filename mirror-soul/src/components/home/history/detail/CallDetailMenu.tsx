import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { Feather } from '@expo/vector-icons';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { MatchAvatar } from '@/src/features/match/components/MatchAvatar';
import { useLayout } from '@/src/hooks/useLayout';
import type { TalkLogListResult } from '@/src/types/api/history';
import { historyMenuLayout, type HistoryMenuAnchor } from './historyMenuLayout';
import { SUPPORT_EMAIL } from '@/src/features/customer-center/constants/faqData';

type MenuPage = 'actions' | 'info' | 'guide' | 'report';
export const REPORT_REASONS = ['부적절한 대화', '사칭·허위 프로필', '스팸·광고', '괴롭힘·위협', '기타'] as const;

/** Button-anchored popover; subpages share the same surface and Android back behavior. */
export default function CallDetailMenu({ isOpen, data, headerBottom, anchor, onClose, onRefresh, onProfile, onBlock, onReport, editing, refreshing, userActionsDisabled, reporting }: {
  isOpen: boolean;
  data: TalkLogListResult;
  headerBottom: number;
  anchor: HistoryMenuAnchor | null;
  onClose: () => void;
  onRefresh: () => void;
  editing: boolean;
  refreshing: boolean;
  onProfile: () => void;
  onBlock: () => void;
  onReport: (reason: string) => Promise<boolean>;
  userActionsDisabled: boolean;
  reporting: boolean;
}) {
  const { colors, palette } = useMatchingDesign();
  const { height, width, fontScale } = useWindowDimensions();
  const { contentWidth } = useLayout();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<MenuPage>('actions');
  const [reason, setReason] = useState<string | null>(null);
  const [mailOpened, setMailOpened] = useState(false);
  const reportVersion = useRef(0);
  useEffect(() => { if (!isOpen) setPage('actions'); }, [isOpen]);
  useEffect(() => { if (!isOpen) { reportVersion.current += 1; setReason(null); setMailOpened(false); } }, [isOpen]);
  useEffect(() => () => { reportVersion.current += 1; }, []);
  useEffect(() => {
    if (!isOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 'actions') onClose();
      else setPage('actions');
      return true;
    });
    return () => subscription.remove();
  }, [isOpen, onClose, page]);
  if (!isOpen) return null;

  const { above, connectorLeft, ...layout } = historyMenuLayout({ width, height, fontScale, contentWidth, insets, anchor, headerBottom });
  const editableCount = data.talkLogs.filter(log => log.editable).length;
  const date = new Date(data.startedAt);
  const dateLabel = Number.isFinite(date.getTime())
    ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} · ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : '일시 정보 없음';
  return <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
    <Pressable accessible={false} onPress={onClose} style={[StyleSheet.absoluteFill, styles.backdrop]} />
    <View style={[styles.menu, layout, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      <View pointerEvents="none" style={[styles.connector, { left: connectorLeft, ...(above ? { bottom: -6 } : { top: -6 }), backgroundColor: colors.background.card, borderColor: colors.border.primary }]} />
      <ScrollView style={[styles.scroll, { backgroundColor: colors.background.card }]} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          {page !== 'actions' && <Pressable onPress={() => setPage('actions')} accessibilityRole="button" accessibilityLabel="통화 기록 메뉴로 돌아가기" style={styles.iconButton}>
            <Feather name="chevron-left" size={20} color={colors.text.secondary} />
          </Pressable>}
          <Text accessibilityRole="header" variant="heading" style={[styles.title, { color: colors.text.primary }]}>{page === 'info' ? '통화 정보' : page === 'guide' ? '기록 안내' : page === 'report' ? '사용자 신고' : '더보기'}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="통화 기록 메뉴 닫기" style={styles.iconButton}>
            <Feather name="x" size={20} color={colors.text.secondary} />
          </Pressable>
        </View>
        {page === 'actions' ? <>
          <MenuAction icon="user" label="사용자 상세 보기" disabled={userActionsDisabled} onPress={onProfile} />
          <MenuAction icon="clock" label="통화 정보" onPress={() => setPage('info')} />
          <MenuAction icon="refresh-cw" label={refreshing ? '기록을 확인하고 있어요' : '기록 새로고침'} disabled={editing || refreshing || reporting} onPress={onRefresh} />
          <MenuAction icon="info" label="기록 안내" onPress={() => setPage('guide')} />
          <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />
          <MenuAction icon="flag" label="사용자 신고하기" disabled={userActionsDisabled} onPress={() => setPage('report')} />
          <MenuAction icon="slash" label="사용자 차단하기" danger disabled={userActionsDisabled} onPress={onBlock} />
          {editing && <Text style={[styles.note, { color: colors.text.secondary }]}>수정 중인 답변을 저장하거나 취소한 뒤 이용해주세요.</Text>}
        </> : page === 'info' ? <View style={styles.details}>
          <View style={styles.person}>
            <MatchAvatar name={data.partner.name} url={data.partner.profileImageUrl} size={48} />
            <View style={styles.personCopy}>
              <Text variant="heading" style={[styles.name, { color: colors.text.primary }]}>{data.partner.name || '상대방'}님</Text>
              {data.partner.age != null && <Text style={[styles.note, { color: colors.text.secondary }]}>{data.partner.age}세</Text>}
            </View>
          </View>
          <Text style={[styles.body, { color: colors.text.primary }]}>{data.description}</Text>
          <InfoRow label="통화 일시" value={dateLabel} />
          {data.callNumber > 0 && <InfoRow label="상대와의 통화" value={`${data.callNumber}번째`} />}
          <InfoRow label="수정 가능한 답변" value={`${editableCount}개`} />
        </View> : page === 'report' ? <View style={styles.details}>
          <Text style={[styles.body, { color: colors.text.primary }]}>어떤 문제가 있었나요?</Text>
          <View>
            {REPORT_REASONS.map(item => <Pressable key={item} accessibilityRole="radio" accessibilityLabel={item} accessibilityState={{ checked: reason === item, disabled: reporting }} disabled={reporting}
              onPress={() => { reportVersion.current += 1; setReason(item); setMailOpened(false); }} style={[styles.reason, { borderColor: reason === item ? palette.softBorder : colors.border.primary, backgroundColor: reason === item ? palette.coolTint : 'transparent' }]}>
              <Text style={[styles.actionLabel, { color: colors.text.primary }]}>{item}</Text>
              <Feather name={reason === item ? 'check-circle' : 'circle'} size={18} color={reason === item ? palette.accentInk : colors.text.muted} />
            </Pressable>)}
          </View>
          <Text style={[styles.note, { color: colors.text.secondary }]}>메일 앱에서 내용을 더 적고 전송해주세요. 대화 원문과 음성은 자동으로 첨부하지 않아요.</Text>
          <Text selectable style={[styles.note, { color: colors.text.secondary }]}>받는 주소: {SUPPORT_EMAIL}</Text>
          <MenuAction icon="mail" label={reporting ? '메일 앱을 열고 있어요' : '신고 메일 작성'} disabled={!reason || reporting || userActionsDisabled} onPress={() => {
            const version = reportVersion.current;
            if (reason) void onReport(reason).then(opened => { if (version === reportVersion.current) setMailOpened(opened); });
          }} />
          {mailOpened && <Text accessibilityLiveRegion="polite" style={[styles.note, { color: palette.accentInk }]}>메일 앱에서 전송을 완료해주세요. 여기서는 접수 여부를 확인할 수 없어요.</Text>}
        </View> : <View style={styles.details}>
          {[
            ['지난 대화를 다시 읽어요', '이 화면은 통화에서 나눈 대화의 텍스트 기록이에요. 실시간 메시지방과는 별개입니다.'],
            ['내 트윈의 답변만 수정해요', '내 트윈이 응답한 기록 중 수정 가능한 답변에만 수정 버튼이 표시돼요. 다른 사람이나 상대 트윈의 답변은 바꿀 수 없어요.'],
            ['수정한 문장은 기록에 저장돼요', '답변 수정은 이 대화 기록에 반영돼요. 즉시 트윈이 재학습된다는 뜻은 아닙니다.'],
            ['전화 버튼으로 새 대화를 시작해요', '상대의 AI 트윈과 새 통화를 시작해요. 실제 상대방에게 전화를 거는 기능은 아니에요. 남은 시간은 통화 전에 다시 확인합니다.'],
          ].map(([title, body]) => <View key={title} style={styles.guideItem}>
            <Text style={[styles.guideTitle, { color: palette.accentInk }]}>{title}</Text>
            <Text style={[styles.body, { color: colors.text.secondary }]}>{body}</Text>
          </View>)}
        </View>}
      </ScrollView>
    </View>
  </View>;
}

function MenuAction({ icon, label, disabled = false, danger = false, onPress }: {
  icon: React.ComponentProps<typeof Feather>['name']; label: string; disabled?: boolean; danger?: boolean; onPress: () => void;
}) {
  const { colors, palette } = useMatchingDesign();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.action, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    <Feather name={icon} size={20} color={danger ? colors.text.danger : palette.accentInk} />
    <Text style={[styles.actionLabel, { color: danger ? colors.text.danger : colors.text.primary }]}>{label}</Text>
    <Feather name="chevron-right" size={16} color={colors.text.muted} />
  </Pressable>;
}
function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useMatchingDesign();
  return <View style={[styles.infoRow, { borderTopColor: colors.border.primary }]}>
    <Text style={[styles.note, { color: colors.text.secondary }]}>{label}</Text>
    <Text style={[styles.body, { color: colors.text.primary }]}>{value}</Text>
  </View>;
}
const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.12)' },
  menu: { position: 'absolute', borderRadius: 20, borderWidth: 1, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, shadowOpacity: 0.12 },
  connector: { position: 'absolute', width: 10, height: 10, borderWidth: StyleSheet.hairlineWidth, transform: [{ rotate: '45deg' }] },
  scroll: { borderRadius: 20, overflow: 'hidden', flexShrink: 1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 6, marginHorizontal: 10 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, padding: 10, marginBottom: 6, borderWidth: 1, borderRadius: 12 },
  content: { padding: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  title: { flex: 1, minWidth: 0, fontSize: 17, lineHeight: 25, fontWeight: '600', paddingLeft: 8 },
  iconButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  action: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  actionLabel: { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 23, fontWeight: '500' },
  note: { fontSize: 12, lineHeight: 20 },
  details: { padding: 8, gap: 16 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personCopy: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 23 },
  infoRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 4 },
  guideItem: { gap: 6 },
  guideTitle: { fontSize: 14, lineHeight: 23, fontWeight: '600' },
});
