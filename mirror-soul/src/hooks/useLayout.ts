import { Layout } from '@/src/constants/theme';
import { useWindowDimensions } from 'react-native';
import { calculateRW, calculateRH } from '@/src/utils/responsive';

/**
 * 전역 반응형 레이아웃 너비/높이/패딩 관리를 위한 훅 (단일 진실 공급원)
 * 프로젝트 내 파편화된 하드코딩 레이아웃 값을 통합 관리합니다.
 */
export function useLayout() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // 1. 컨텐츠가 가질 수 있는 최대 너비 (좌우 패딩 포함)
  // 기기가 MAX_CONTENT_WIDTH(345)보다 작을 경우 화면 전체 너비를 사용합니다.
  const contentWidth = Math.min(windowWidth, Layout.MAX_CONTENT_WIDTH);

  // 2. 화면 전역 좌우 패딩 값
  const screenPadding = Layout.SCREEN_PADDING;

  // 3. 카드 등 자식 요소의 권장 너비 (컨텐츠 최대 너비 - 양옆 패딩)
  // Layout.SCREEN_PADDING이 컨테이너에 적용된 상태에서 자식 컴포넌트의 정확한 너비를 계산할 때 사용합니다.
  const cardWidth = contentWidth - (screenPadding * 2);

  // 4. 피그마 기준 반응형 스케일링 함수 (회전 시 동적 업데이트 됨)
  const rw = (width: number) => calculateRW(width, windowWidth);
  const rh = (height: number) => calculateRH(height, windowHeight);
  const rf = (size: number) => calculateRW(size, windowWidth);

  return {
    windowWidth,
    windowHeight,
    contentWidth,
    screenPadding,
    cardWidth,
    rw,
    rh,
    rf,
  };
}
