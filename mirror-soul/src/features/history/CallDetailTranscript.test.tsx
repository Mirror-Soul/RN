import React from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import CallDetailBody from '@/src/components/home/history/detail/CallDetailBody';
import CallDetailSummary from '@/src/components/home/history/detail/CallDetailSummary';
import TalkLogEditor from '@/src/components/home/history/detail/TalkLogEditor';
import ChatBubble from '@/src/components/home/history/detail/parts/ChatBubble';
import ChatEditForm from '@/src/components/home/history/detail/parts/ChatEditForm';
import type { TalkLogListResult, TalkLogResponse, TalkLogResult } from '@/src/types/api/history';

let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-font', () => ({ isLoaded: () => false }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme, isDark: false }) }));
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ListHeaderComponent, ListFooterComponent, ListEmptyComponent, ...props }: {
    data: unknown[]; renderItem: (info: { item: unknown; index: number }) => React.ReactElement;
    ListHeaderComponent: React.ReactElement; ListFooterComponent: React.ReactElement; ListEmptyComponent: React.ReactElement;
  }) => {
    const NativeView = jest.requireActual('react-native').View;
    return <NativeView testID="transcript-list" {...props}>{ListHeaderComponent}
      {data.length ? data.map((item, index) => <NativeView key={index}>{renderItem({ item, index })}</NativeView>) : ListEmptyComponent}
      {ListFooterComponent}
    </NativeView>;
  },
}));

const log = (changes: Partial<TalkLogResult> = {}): TalkLogResult => ({
  talkLogId: 1, speaker: 'MY_TWIN', message: '주말에는 산책하는 걸 좋아해요.',
  startedAt: '2026-10-05T14:30:00', endedAt: '2026-10-05T14:30:20',
  editable: true, edited: false, editedAt: null, ...changes,
});
const response = (): TalkLogResponse => ({ isSuccess: true, code: 'COMMON200', message: '성공', error: '', result: log({ message: '새 답변', edited: true }) });
const context = (logs: TalkLogResult[]): TalkLogListResult => ({
  callId: 41, callNumber: 3, startedAt: '2026-10-05T14:30:00', description: '지수와 내 Twin의 대화',
  partner: { userUuid: 'partner', name: '지수', age: 26, profileImageUrl: null, twinSyncRate: 85 }, talkLogs: logs,
});
const editorInput = (screen: ReturnType<typeof render>) => screen.getByLabelText('내 AI 트윈 답변 내용');
beforeEach(() => { mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 }; });
afterEach(() => jest.restoreAllMocks());

it.each([
  ['ME', '나'], ['MY_TWIN', '내 AI 트윈'], ['PARTNER', '지수'], ['PARTNER_TWIN', '지수의 AI 트윈'],
] as const)('labels %s explicitly and only allows editing the owner’s twin', (speaker, label) => {
  const edit = jest.fn();
  const screen = render(<ChatBubble message={log({ speaker })} partnerName="지수" hideSpeakerLabel={false} onEditStart={edit} />);
  expect(screen.getByText(label)).toBeTruthy();
  if (speaker === 'MY_TWIN') {
    fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
    expect(edit).toHaveBeenCalledWith(1, log().message);
  } else expect(screen.queryByLabelText('내 AI 트윈 답변 수정')).toBeNull();
});

it('does not merge different speakers just because they are on the same side', () => {
  const screen = render(<CallDetailBody talkLogs={[log({ speaker: 'ME', editable: false }), log({ talkLogId: 2 }), log({ talkLogId: 3 })]} partnerName="지수" onSaveTalkLog={jest.fn()} isSaving={false} />);
  expect(screen.getAllByText('나')).toHaveLength(1);
  expect(screen.getAllByText('내 AI 트윈')).toHaveLength(1);
});

it('keeps failed edits intact and retries the same corrected text', async () => {
  const save = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response());
  const editing = jest.fn();
  const screen = render(<CallDetailBody talkLogs={[log()]} partnerName="지수" onSaveTalkLog={save} isSaving={false} onEditingChange={editing} />);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  expect(editing).toHaveBeenLastCalledWith(true);
  fireEvent.changeText(editorInput(screen), '  새로운 답변이에요.  ');
  fireEvent.press(screen.getByLabelText('수정한 답변 저장'));
  await waitFor(() => expect(screen.getByText('저장하지 못했어요. 작성한 내용은 그대로 있으니 다시 시도해 주세요.')).toBeTruthy());
  expect(editorInput(screen).props.value).toBe('  새로운 답변이에요.  ');
  fireEvent.press(screen.getByLabelText('수정한 답변 저장'));
  await waitFor(() => expect(screen.queryByLabelText('내 AI 트윈 답변 내용')).toBeNull());
  expect(save.mock.calls).toEqual([[1, '새로운 답변이에요.'], [1, '새로운 답변이에요.']]);
  expect(editing).toHaveBeenLastCalledWith(true);
  // iOS keeps call actions locked until the native editor is actually dismissed.
  fireEvent(screen.UNSAFE_getByType(Modal), 'dismiss');
  expect(editing).toHaveBeenLastCalledWith(false);
});

it('locks duplicate saves synchronously and prevents closing while saving', async () => {
  let resolve!: (result: TalkLogResponse) => void;
  const save = jest.fn(() => new Promise<TalkLogResponse>(done => { resolve = done; }));
  const screen = render(<CallDetailBody talkLogs={[log()]} partnerName="지수" onSaveTalkLog={save} isSaving={false} />);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  fireEvent.changeText(editorInput(screen), '새 답변');
  const press = screen.UNSAFE_getByType(ChatEditForm).props.onSave;
  act(() => { press(); press(); });
  expect(save).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('답변 수정 취소')).toBeDisabled();
  expect(screen.getByLabelText('답변 수정 닫기')).toBeDisabled();
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  expect(editorInput(screen)).toBeTruthy();
  await act(async () => { resolve(response()); });
  expect(screen.queryByLabelText('내 AI 트윈 답변 내용')).toBeNull();
});

it('rejects blank and overlong changes and closes unchanged drafts without requesting a save', () => {
  const save = jest.fn();
  const screen = render(<CallDetailBody talkLogs={[log()]} partnerName="지수" onSaveTalkLog={save} isSaving={false} />);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  fireEvent.changeText(editorInput(screen), '   ');
  expect(screen.getByLabelText('수정한 답변 저장')).toBeDisabled();
  fireEvent.changeText(editorInput(screen), '가'.repeat(2001));
  expect(screen.getByText('2,000자 이하로 줄여주세요.')).toBeTruthy();
  expect(screen.getByLabelText('수정한 답변 저장')).toBeDisabled();
  fireEvent.changeText(editorInput(screen), log().message);
  fireEvent.press(screen.getByLabelText('수정한 답변 저장'));
  expect(screen.queryByLabelText('내 AI 트윈 답변 내용')).toBeNull();
  expect(save).not.toHaveBeenCalled();
});

it('asks before discarding edits on hardware back and keeps them until confirmed', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<CallDetailBody talkLogs={[log()]} partnerName="지수" onSaveTalkLog={jest.fn()} isSaving={false} />);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  fireEvent.changeText(editorInput(screen), '저장하기 전이에요.');
  fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  expect(editorInput(screen).props.value).toBe('저장하기 전이에요.');
  act(() => alert.mock.calls[0][2]![1].onPress?.());
  expect(screen.queryByLabelText('내 AI 트윈 답변 내용')).toBeNull();
});

it('releases Android editing controls without relying on the iOS-only dismiss event', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const editing = jest.fn();
  const screen = render(<CallDetailBody talkLogs={[log()]} partnerName="지수" onSaveTalkLog={jest.fn()} isSaving={false} onEditingChange={editing} />);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  expect(editing).toHaveBeenLastCalledWith(true);
  fireEvent.press(screen.getByLabelText('답변 수정 취소'));
  expect(screen.queryByLabelText('내 AI 트윈 답변 내용')).toBeNull();
  expect(editing).toHaveBeenLastCalledWith(false);
});

it('ignores a late save from an unmounted record', async () => {
  let resolve!: (result: TalkLogResponse) => void;
  const save = jest.fn(() => new Promise<TalkLogResponse>(done => { resolve = done; }));
  const screen = render(<View><CallDetailBody key="41" talkLogs={[log()]} partnerName="지수" onSaveTalkLog={save} isSaving={false} /></View>);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  fireEvent.changeText(editorInput(screen), '이전 기록의 수정');
  fireEvent.press(screen.getByLabelText('수정한 답변 저장'));
  screen.rerender(<View><CallDetailBody key="42" talkLogs={[log({ talkLogId: 2 })]} partnerName="새 상대" onSaveTalkLog={save} isSaving={false} /></View>);
  fireEvent.press(screen.getByLabelText('내 AI 트윈 답변 수정'));
  await act(async () => resolve(response()));
  expect(editorInput(screen).props.value).toBe(log().message);
});

it('handles an empty transcript without inventing a conversation or a sync score', () => {
  const data = context([]);
  data.startedAt = 'invalid';
  const screen = render(<CallDetailBody talkLogs={[]} partnerName="지수" onSaveTalkLog={jest.fn()} isSaving={false} summary={<CallDetailSummary data={data} />} />);
  expect(screen.getByText('아직 표시할 대화가 없어요')).toBeTruthy();
  expect(screen.getByText('일시 정보 없음')).toBeTruthy();
  expect(screen.queryByText(/85/)).toBeNull();
});

it('only advertises correction when the server grants access to the owner’s twin', () => {
  const screen = render(<CallDetailSummary data={context([log({ speaker: 'PARTNER_TWIN', editable: false })])} />);
  expect(screen.queryByText(/내 AI 트윈의 답변은 수정/)).toBeNull();
  screen.rerender(<CallDetailSummary data={context([log()])} />);
  expect(screen.getByText('내 AI 트윈의 답변은 수정할 수 있어요. 수정한 문장은 이 기록에 저장돼요.')).toBeTruthy();
});

it.each([
  [320, 568, 1.5], [393, 852, 1], [740, 360, 2], [1024, 1366, 2],
])('keeps long content unrestricted and editing actions scroll-reachable at %sx%s, font %s', (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  const message = '긴 대화 내용🙂 '.repeat(160);
  const bubble = render(<ChatBubble message={log({ message, startedAt: 'invalid' })} partnerName={'긴닉네임'.repeat(20)} hideSpeakerLabel={false} onEditStart={jest.fn()} />);
  expect(bubble.getByText(message).props.numberOfLines).toBeUndefined();
  expect(bubble.getByText(message).props.selectable).toBe(true);
  expect(bubble.queryByText(/NaN/)).toBeNull();
  bubble.unmount();
  const screen = render(<TalkLogEditor text={message} saving={false} failed={false} onChange={jest.fn()} onSave={jest.fn()} onCancel={jest.fn()} />);
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(scroll.findByProps({ accessibilityLabel: '수정한 답변 저장' })).toBeTruthy();
  expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
  const input = screen.UNSAFE_getByType(TextInput);
  expect(input.props.scrollEnabled).toBe(true);
  expect(StyleSheet.flatten(input.props.style).height).toBeGreaterThanOrEqual(128);
  for (const label of ['답변 수정 취소', '수정한 답변 저장']) {
    const button = screen.getByLabelText(label);
    expect(StyleSheet.flatten(button.props.style).minHeight).toBeGreaterThanOrEqual(48);
  }
  expect(screen.UNSAFE_getAllByType(View).length).toBeGreaterThan(0);
});
