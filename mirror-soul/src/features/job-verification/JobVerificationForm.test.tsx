import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { JobVerificationForm } from './JobVerificationForm';
import VerificationModal from '@/src/components/home/grow/modals/VerificationModal';
import { resetEvidenceDraft, useEvidenceDraft } from './evidenceDraft';
import type { JobReviewResult } from '@/src/types/api/jobVerification';

let mockOwner = 'me';
let mockError = false;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
let mockReview: JobReviewResult;
const mockRefetch = jest.fn(); const mockPick = jest.fn(); const mockCamera = jest.fn();
const mockPermission = jest.fn(); const mockToast = jest.fn(); const mockSubmit = jest.fn(); const mockUpload = jest.fn();
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: Object.assign((s: (v: unknown) => unknown) => s({ userUuid: mockOwner, isLoggedIn: true }), { getState: () => ({ userUuid: mockOwner, isLoggedIn: true }) }) }));
jest.mock('@/src/features/profile/hooks/useIntroductionQuery', () => ({ useIntroductionQuery: () => ({ data: { job: 'IT_TECH' }, isLoading: false, isError: false, refetch: mockRefetch }) }));
jest.mock('./useJobReviewQuery', () => ({ jobReviewKey: (owner: string) => ['job-verification', owner], useJobReviewQuery: () => ({ data: mockError ? undefined : mockReview, isLoading: false, isError: mockError, isFetching: false, refetch: mockRefetch }) }));
jest.mock('@/src/features/profile/hooks/useProfileRefresh', () => ({ useProfileRefresh: jest.fn() }));
jest.mock('@/src/services/queryClient', () => ({ queryClient: { invalidateQueries: jest.fn(), setQueryData: jest.fn() } }));
jest.mock('@/src/services/jobVerificationService', () => ({ submitJobDocuments: (...args: unknown[]) => mockSubmit(...args) }));
jest.mock('@/src/services/fileService', () => ({ getPresignedUrl: async () => ({ result: { presignedUrl: 'https://upload.test', objectKey: 'key-one' } }) }));
jest.mock('@/src/services/s3Service', () => ({ uploadFileToS3: (...args: unknown[]) => mockUpload(...args) }));
jest.mock('./prepareEvidencePhoto', () => ({ MAX_EVIDENCE_BYTES: 5 * 1024 * 1024, deleteEvidencePhoto: jest.fn(), prepareEvidencePhoto: async (uri: string) => ({ id: uri, uri, size: 50000, width: 600, height: 800 }) }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: (...args: unknown[]) => mockPick(...args), launchCameraAsync: (...args: unknown[]) => mockCamera(...args), requestCameraPermissionsAsync: () => mockPermission() }));
jest.mock('expo-image', () => ({ Image: jest.requireActual('react-native').View }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('@/src/hooks/useLayout', () => ({ useLayout: () => ({ contentContainerStyle: { maxWidth: 500, alignSelf: 'center' } }) }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@/src/components/common/BottomSheet/BottomSheet', () => ({ BottomSheet: ({ children, ...props }: { children: React.ReactNode }) => {
  const View = jest.requireActual('react-native').View;
  return <View testID="sheet" {...props}>{children}</View>;
} }));

beforeEach(() => {
  jest.clearAllMocks(); mockOwner = 'me'; mockError = false;
  mockReview = { requestId: null, status: null, claimedJob: null, submittedAt: null, reviewedAt: null, rejectionReason: null, appliesToCurrentJob: false, passVerificationRequired: false };
  resetEvidenceDraft('me', 'IT_TECH');
  mockPick.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///one.jpg' }] });
  mockPermission.mockResolvedValue({ granted: false });
  mockUpload.mockResolvedValue(undefined);
  mockSubmit.mockResolvedValue({ isSuccess: true, result: { requestId: 42, status: 'PENDING', claimedJob: 'IT_TECH' } });
});

it('does not submit on selection and retains the draft when returning to the same member', async () => {
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByLabelText('선택한 직업 서류 사진 1')).toBeTruthy());
  expect(mockSubmit).not.toHaveBeenCalled(); expect(mockUpload).not.toHaveBeenCalled();
  screen.unmount();
  const reopened = render(<JobVerificationForm onClose={jest.fn()} />);
  expect(reopened.getByLabelText('선택한 직업 서류 사진 1')).toBeTruthy();
  fireEvent.press(reopened.getByRole('button', { name: '서류 제출' }));
  await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith(['key-one']));
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith('직업 서류 심사를 접수했어요.', 'success'));
});

it('preserves a selected photo on picker cancellation and offers local deletion', async () => {
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByLabelText('선택한 직업 서류 사진 1')).toBeTruthy());
  mockPick.mockResolvedValueOnce({ canceled: true });
  fireEvent.press(screen.getByLabelText('직업 서류 사진 1 바꾸기'));
  await waitFor(() => expect(useEvidenceDraft.getState().busy).toBe(false));
  expect(screen.getByLabelText('선택한 직업 서류 사진 1')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('직업 서류 사진 1 삭제'));
  expect(screen.queryByLabelText('선택한 직업 서류 사진 1')).toBeNull();
});

it('shows a rejected reason fully and allows resubmission', () => {
  mockReview = { ...mockReview, requestId: 42, status: 'REJECTED', appliesToCurrentJob: true, rejectionReason: '사진 속 직업 정보가 잘리지 않도록 다시 촬영해 주세요.'.repeat(8) };
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  expect(screen.getByText(mockReview.rejectionReason!)).toBeTruthy();
  expect(screen.getByRole('button', { name: '보완한 서류 제출' })).toBeDisabled();
});

it('never offers upload when status lookup fails and does not describe it as unsubmitted', () => {
  mockError = true;
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  expect(screen.getByText('신청 상태를 불러오지 못했어요.')).toBeTruthy();
  expect(screen.queryByLabelText('사진첩에서 직업 서류 선택')).toBeNull();
});

it('requires replacement after a selected document preview fails', async () => {
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  await waitFor(() => expect(screen.getByLabelText('선택한 직업 서류 사진 1')).toBeTruthy());
  fireEvent(screen.getByLabelText('선택한 직업 서류 사진 1'), 'error');
  expect(screen.getByRole('button', { name: '서류 제출' })).toBeDisabled();
  expect(screen.getByText('사진을 불러오지 못했어요. 다른 사진으로 바꿔주세요.')).toBeTruthy();
});

it('blocks camera launch after a permission refusal', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('직업 서류 촬영'));
  await waitFor(() => expect(alert).toHaveBeenCalled()); expect(mockCamera).not.toHaveBeenCalled();
  alert.mockRestore();
});

it('ignores an old account picker result', async () => {
  let finish!: (result: unknown) => void;
  mockPick.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<JobVerificationForm onClose={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('사진첩에서 직업 서류 선택'));
  mockOwner = 'another'; screen.rerender(<JobVerificationForm onClose={jest.fn()} />);
  await act(async () => finish({ canceled: false, assets: [{ uri: 'file:///old-private.jpg' }] }));
  expect(screen.queryByLabelText('선택한 직업 서류 사진 1')).toBeNull();
});

it.each([[320, 568, 2], [393, 852, 1], [740, 360, 2], [1024, 1366, 1.5]])('keeps the action outside the scroll area with a bounded sheet at %sx%s, font %s', (width, height, fontScale) => {
  mockDimensions = { width, height, fontScale, scale: 3 };
  const screen = render(<VerificationModal isOpen onClose={jest.fn()} />);
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(scroll.findAllByProps({ accessibilityState: { disabled: true, busy: false } })).toHaveLength(0);
  const button = screen.getByRole('button', { name: '서류 제출' });
  expect(StyleSheet.flatten(button.props.style).minHeight).toBeGreaterThanOrEqual(48);
  expect(screen.getByTestId('sheet').props.height).toBeLessThanOrEqual(height - 44);
  expect(screen.getByTestId('sheet').props.dragFromHandleOnly).toBe(true);
});
