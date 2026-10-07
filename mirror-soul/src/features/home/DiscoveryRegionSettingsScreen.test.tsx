import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Keyboard, ScrollView, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import Screen from '../../../app/discovery-region-settings';
import type { RegionCoordinate } from '@/src/types/api/region';

const mockSession = { isLoggedIn: true, userUuid: 'me' };
jest.mock('@/src/store/useAuthStore', () => ({ useAuthStore: { getState: () => mockSession } }));

const mockRegions: RegionCoordinate[] = Array.from({ length: 60 }, (_, i) => ({ regionId: i + 1, sidoName: '서울', sigunguName: '성동구', eupmyeondongName: `동네${i + 1}`, latitude: 37.54 + i * 0.001, longitude: 127.04 + i * 0.001 }));
let mockPreference: { data: { anchorRegionId: number; nearbyCount: number } | null; isPending: boolean; isError: boolean };
let mockCoordinateError = false;
let mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
const mockSave = jest.fn();
const mockToast = jest.fn();
const mockBack = jest.fn();
const mockFit = jest.fn();
const mockAnimate = jest.fn();
const mockCoordinateRetry = jest.fn();
jest.mock('@/src/hooks/useThemeColors', () => ({ useThemeColors: () => ({ colors: jest.requireActual('@/src/constants/theme').lightTheme }) }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }) }));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('expo-router', () => ({ router: { back: () => mockBack() } }));
jest.mock('expo-location', () => ({ Accuracy: { Balanced: 3 }, getForegroundPermissionsAsync: jest.fn(), requestForegroundPermissionsAsync: jest.fn(), getCurrentPositionAsync: jest.fn() }));
jest.mock('@/src/components/common/Toast/ToastProvider', () => ({ useToast: () => ({ showToast: mockToast }) }));
jest.mock('./hooks/useRegionCoordinatesQuery', () => ({ useRegionCoordinatesQuery: () => ({ data: mockRegions, isLoading: false, isError: mockCoordinateError, refetch: mockCoordinateRetry }) }));
jest.mock('./hooks/usePreferredRegionQuery', () => ({ usePreferredRegionQuery: () => mockPreference }));
jest.mock('./hooks/useRegionSearchQuery', () => ({ useRegionSearchQuery: () => ({ data: [], isFetching: false, isError: false }) }));
jest.mock('./hooks/useUpdatePreferredRegionMutation', () => ({ useUpdatePreferredRegionMutation: () => ({ mutateAsync: mockSave, isPending: false }) }));
jest.mock('@/src/components/discovery/RegionRadiusSlider', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View, Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return function MockSlider({ steps, onValueChange, disabled }: { steps: number[]; onValueChange: (count: number) => void; disabled: boolean }) { return <View>{steps.map(step => <Pressable key={step} disabled={disabled} accessibilityLabel={`${step}개 동 선택`} onPress={() => onValueChange(step)}><Text>{step}개</Text></Pressable>)}</View>; };
});
jest.mock('react-native-maps', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(function MockMap(props: object, ref: React.Ref<unknown>) { React.useImperativeHandle(ref, () => ({ fitToCoordinates: mockFit, animateToRegion: mockAnimate })); return <View {...props} />; }),
    Marker: ({ identifier, ...props }: { identifier: string }) => <View testID={`marker-${identifier}`} {...props} />,
    Circle: (props: object) => <View {...props} />,
    PROVIDER_GOOGLE: 'google',
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSession.isLoggedIn = true; mockSession.userUuid = 'me';
  mockDimensions = { width: 393, height: 852, fontScale: 1, scale: 3 };
  mockPreference = { data: { anchorRegionId: 1, nearbyCount: 10 }, isPending: false, isError: false };
  mockCoordinateError = false;
  mockSave.mockResolvedValue({});
  (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
  (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 37.541, longitude: 127.041 } });
});

it.each([1, 10, 30, 50])('saves %i neighborhoods including the anchor and renders all included native markers', async count => {
  const screen = render(<Screen />);
  await act(async () => {});
  fireEvent.press(screen.getByLabelText(`${count}개 동 선택`));
  expect(screen.getAllByTestId(/^marker-/)).toHaveLength(count);
  if (count === 1) expect(screen.getByText(/이 동네만 탐색해요/)).toBeTruthy();
  else expect(screen.getByText(new RegExp(`기준 동네 포함 ${count}개 동`))).toBeTruthy();
  await act(async () => fireEvent.press(screen.getByLabelText('지역 설정 완료')));
  expect(mockSave).toHaveBeenCalledWith({ anchorRegionId: 1, nearbyCount: count });
  expect(mockBack).toHaveBeenCalledTimes(1);
});

it('fits the full selected area only after the native map is ready and measured', async () => {
  const screen = render(<Screen />);
  await act(async () => {});
  expect(mockFit).not.toHaveBeenCalled();
  const map = screen.getByTestId('discovery-region-map');
  fireEvent(map.parent!, 'layout', { nativeEvent: { layout: { width: 350, height: 400 } } });
  fireEvent(map, 'mapReady');
  expect(mockFit.mock.calls.at(-1)?.[0]).toHaveLength(10);
  fireEvent.press(screen.getByLabelText('50개 동 선택'));
  expect(mockFit.mock.calls.at(-1)?.[0]).toHaveLength(50);
});

it('does not let a late preference response overwrite a manually tapped anchor', async () => {
  mockPreference = { data: null, isPending: true, isError: false };
  const screen = render(<Screen />);
  await act(async () => {});
  fireEvent(screen.getByTestId('discovery-region-map'), 'press', { nativeEvent: { coordinate: mockRegions[5], action: 'press' } });
  mockPreference = { data: { anchorRegionId: 1, nearbyCount: 50 }, isPending: false, isError: false };
  screen.rerender(<Screen />);
  expect(screen.getByTestId('marker-selected-anchor').props.coordinate.regionId).toBe(6);
});

it('does not change the anchor when opening an included marker callout', async () => {
  const screen = render(<Screen />);
  await act(async () => {});
  fireEvent(screen.getByTestId('discovery-region-map'), 'press', { nativeEvent: { coordinate: mockRegions[5], action: 'marker-press' } });
  expect(screen.getByTestId('marker-selected-anchor').props.coordinate.regionId).toBe(1);
});

it('shows location only with permission and prevents duplicate location requests', async () => {
  let finish!: (value: object) => void;
  (Location.getCurrentPositionAsync as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<Screen />);
  await act(async () => {});
  expect(screen.getByTestId('discovery-region-map').props.showsUserLocation).toBe(false);
  expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  await act(async () => {
    fireEvent.press(screen.getByLabelText('현재 위치로 동네 선택'));
    fireEvent.press(screen.getByLabelText('현재 위치로 동네 선택'));
  });
  expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('discovery-region-map').props.showsUserLocation).toBe(true);
  await act(async () => finish({ coords: { latitude: 37.541, longitude: 127.041 } }));
  expect(screen.getByTestId('marker-selected-anchor').props.coordinate.regionId).toBe(2);
});

it('preserves a manual selection made while GPS is still resolving', async () => {
  let finish!: (value: object) => void;
  (Location.getCurrentPositionAsync as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<Screen />);
  await act(async () => {});
  await act(async () => fireEvent.press(screen.getByLabelText('현재 위치로 동네 선택')));
  fireEvent(screen.getByTestId('discovery-region-map'), 'press', { nativeEvent: { coordinate: mockRegions[5], action: 'press' } });
  await act(async () => finish({ coords: { latitude: 37.541, longitude: 127.041 } }));
  expect(screen.getByTestId('marker-selected-anchor').props.coordinate.regionId).toBe(6);
});

it('blocks repeated saves and retains selection for retry after failure', async () => {
  let fail!: (error: Error) => void;
  mockSave.mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }));
  const screen = render(<Screen />);
  await act(async () => {});
  fireEvent.press(screen.getByLabelText('30개 동 선택'));
  act(() => { fireEvent.press(screen.getByLabelText('지역 설정 완료')); fireEvent.press(screen.getByLabelText('지역 설정 완료')); });
  expect(mockSave).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByLabelText('50개 동 선택'));
  expect(screen.getAllByTestId(/^marker-/)).toHaveLength(30);
  await act(async () => fail(new Error('network failed')));
  expect(mockBack).not.toHaveBeenCalled();
  expect(screen.getAllByTestId(/^marker-/)).toHaveLength(30);
  await act(async () => fireEvent.press(screen.getByLabelText('지역 설정 완료')));
  expect(mockSave).toHaveBeenCalledTimes(2);
});

it('hides the panel while entering a search and restores it when the keyboard closes', async () => {
  const listeners: Record<string, () => void> = {};
  const spy = jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
    listeners[event] = callback as () => void; return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
  });
  const screen = render(<Screen />);
  await act(async () => {});
  act(() => listeners.keyboardDidShow());
  expect(screen.queryByLabelText('지역 설정 완료')).toBeNull();
  act(() => listeners.keyboardDidHide());
  expect(screen.getByLabelText('지역 설정 완료')).toBeTruthy();
  spy.mockRestore();
});

it('keeps a separate confirmation button outside the scrollable panel on a short display', async () => {
  mockDimensions = { width: 320, height: 360, fontScale: 2, scale: 2 };
  const screen = render(<Screen />);
  await act(async () => {});
  const body = screen.UNSAFE_getByType(ScrollView);
  expect(StyleSheet.flatten(body.props.style).maxHeight).toBeLessThan(120);
  fireEvent(screen.getByLabelText('지역 설정 완료'), 'layout', { nativeEvent: { layout: { height: 90 } } });
  expect(StyleSheet.flatten(body.props.style).maxHeight).toBeLessThanOrEqual(52);
  expect(body.findAll((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel === '지역 설정 완료')).toHaveLength(0);
  expect(screen.getByLabelText('지역 설정 완료')).toBeTruthy();
});

it('reports permission denial without selecting a fake position', async () => {
  (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  const screen = render(<Screen />);
  await act(async () => {});
  await act(async () => fireEvent.press(screen.getByLabelText('현재 위치로 동네 선택')));
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('위치 접근'), 'error'));
  expect(screen.getByTestId('marker-selected-anchor').props.coordinate.regionId).toBe(1);
});


it('does not show a success message or navigate a new account after a late save', async () => {
  let finish!: (value: object) => void;
  mockSave.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const screen = render(<Screen />);
  await act(async () => {});
  act(() => fireEvent.press(screen.getByLabelText('지역 설정 완료')));
  mockSession.userUuid = 'another-user';
  await act(async () => finish({}));
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockToast).not.toHaveBeenCalled();
});

it('does not replace granted location permission with a late initial permission read', async () => {
  let initial!: (result: object) => void;
  (Location.getForegroundPermissionsAsync as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { initial = resolve; }));
  const screen = render(<Screen />);
  await act(async () => fireEvent.press(screen.getByLabelText('현재 위치로 동네 선택')));
  expect(screen.getByTestId('discovery-region-map').props.showsUserLocation).toBe(true);
  await act(async () => initial({ granted: false }));
  expect(screen.getByTestId('discovery-region-map').props.showsUserLocation).toBe(true);
});
