import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useCallAppearance } from './CallAppearance';
import { Colors } from '@/src/constants/theme';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface Props {
  callStatus: CallStatus; onHangUp: () => void; isMuted: boolean; onToggleMute: () => void;
  isSpeakerOn: boolean; onToggleSpeaker: () => void; isCameraOn: boolean; onToggleCamera: () => void;
  isCameraPending?: boolean; vertical?: boolean;
}
export default function CallControls({ callStatus, onHangUp, isMuted, onToggleMute, isSpeakerOn, onToggleSpeaker, isCameraOn, onToggleCamera, isCameraPending = false, vertical = false }: Props) {
  const { colors, palette } = useCallAppearance();
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = React.useState(width - 24);
  const grid = vertical || measuredWidth < 260;
  const enabled = callStatus === 'connected';
  const ending = callStatus === 'ending' || callStatus === 'ended';
  const controls: { label: string; accessibility: string; icon: React.ComponentProps<typeof Feather>['name']; selected: boolean; action: () => void; danger?: boolean; busy?: boolean }[] = [
    { label: '마이크', accessibility: isMuted ? '마이크 켜기' : '마이크 끄기', icon: isMuted ? 'mic-off' : 'mic', selected: isMuted, action: onToggleMute },
    { label: '소리', accessibility: isSpeakerOn ? '자동 출력으로 전환, 이어폰 우선' : '스피커로 전환', icon: isSpeakerOn ? 'volume-2' : 'headphones', selected: isSpeakerOn, action: onToggleSpeaker },
    { label: '내 모습', accessibility: isCameraOn ? '내 모습 확인 끄기' : '내 모습 확인 켜기', icon: isCameraOn ? 'video' : 'video-off', selected: isCameraOn, action: onToggleCamera, busy: isCameraPending },
    { label: '종료', accessibility: '통화 종료', icon: 'phone-off', selected: false, action: onHangUp, danger: true },
  ];
  return <View style={styles.container} onLayout={event => setMeasuredWidth(event.nativeEvent.layout.width)}>
    <View testID="call-control-grid" style={[styles.row, grid && styles.grid]}>{controls.map(control => {
      const disabled = control.danger ? ending : !enabled || !!control.busy;
      return <Pressable key={control.label} onPress={control.action} disabled={disabled} accessibilityRole="button" accessibilityLabel={control.accessibility}
        accessibilityHint={control.label === '내 모습' ? '이 기기에서만 보이고 AI에게 전송되지 않아요.' : undefined}
        accessibilityState={{ disabled, selected: control.selected, busy: !!control.busy }}
        style={({ pressed }) => [styles.control, grid && styles.gridItem, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
        <View style={[styles.circle, { backgroundColor: control.danger ? Colors.primary.recordingRed : control.selected ? palette.tint : colors.background.glass, borderColor: control.danger ? Colors.primary.recordingRed : control.selected ? palette.softBorder : colors.border.primary }]}>
          {control.busy ? <ActivityIndicator color={colors.text.primary} /> : <Feather name={control.icon} size={22} color={control.danger ? Colors.neutral.pureWhite : colors.text.primary} />}
        </View><Text style={[styles.label, { color: colors.text.secondary }]}>{control.label}</Text>
      </Pressable>;
    })}</View>
    {isCameraOn && <Text style={[styles.note, { color: colors.text.secondary }]}>내 모습은 나에게만 보여요</Text>}
    {!ending && <Text style={[styles.note, { color: colors.text.secondary }]}>{isSpeakerOn ? '스피커 출력' : '자동 출력 · 이어폰 우선'}</Text>}
    {ending && <Text style={[styles.note, { color: colors.text.secondary }]}>소리와 영상은 껐어요. 종료를 확인하고 있어요.</Text>}
  </View>;
}
const styles = StyleSheet.create({
  container: { padding: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  grid: { flexWrap: 'wrap', rowGap: 14 },
  control: { flex: 1, minWidth: 0, minHeight: 48, alignItems: 'center', gap: 7 },
  gridItem: { flex: 0, flexGrow: 1, flexBasis: '44%' },
  circle: { width: 48, height: 48, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  label: { alignSelf: 'stretch', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  note: { fontSize: 11, lineHeight: 18, textAlign: 'center' },
});
