import { Layout } from '@/src/constants/theme';
import { useWindowDimensions } from 'react-native';
import { calculateRW, calculateRH } from '@/src/utils/responsive';

export type WindowSizeClass = 'compact' | 'medium' | 'expanded';

function getSizeClass(width: number): WindowSizeClass {
  if (width >= Layout.BREAKPOINTS.expanded) return 'expanded';
  if (width >= Layout.BREAKPOINTS.medium) return 'medium';
  return 'compact';
}

// compact(폰)는 화면 전체를 그대로 쓰고, medium/expanded(태블릿·폴더블 펼침)만 읽기 편한
// 너비로 캡을 씌워 가운데 정렬한다. 폰 화면을 그대로 늘려 보여주는 게 아니라, 넓은 화면일수록
// 콘텐츠 폭 자체를 더 쓰도록(345 고정이 아니라 640/900) 단계적으로 넓힌다.
const CONTENT_MAX_WIDTH: Record<WindowSizeClass, number | undefined> = {
  compact: undefined,
  medium: 640,
  expanded: 900,
};

// 리스트/그리드형 화면(기록 목록, 성장 미션 카드 등)이 참고할 권장 컬럼 수.
const GRID_COLUMNS: Record<WindowSizeClass, number> = {
  compact: 1,
  medium: 2,
  expanded: 3,
};

/**
 * 전역 반응형 레이아웃 훅 (단일 진실 공급원)
 *
 * 화면마다 제각각이던 너비 제한 로직(`Layout.MAX_CONTENT_WIDTH` 하드코딩, 화면별 자체
 * 계산식, 또는 아예 제한 없음)을 여기 하나로 통합한다. 새 화면을 추가하거나 기존 화면의
 * 너비 처리를 손볼 때는 항상 이 훅을 통해서 할 것 — 화면에 `maxWidth` 숫자를 직접 쓰지 말 것.
 */
export function useLayout() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const sizeClass = getSizeClass(windowWidth);
  const isCompact = sizeClass === 'compact';

  // 1. 컨텐츠가 가질 수 있는 최대 너비(캡이 없으면 undefined)
  const contentMaxWidth = CONTENT_MAX_WIDTH[sizeClass];
  // 2. 실제로 적용될 컨텐츠 너비 (캡보다 화면이 좁으면 화면 너비를 그대로 씀)
  const contentWidth = contentMaxWidth ? Math.min(windowWidth, contentMaxWidth) : windowWidth;

  // 3. 화면 전역 좌우 패딩 값
  const screenPadding = Layout.SCREEN_PADDING;

  // 4. 카드 등 자식 요소의 권장 너비 (컨텐츠 너비 - 양옆 패딩)
  const cardWidth = contentWidth - screenPadding * 2;

  // 5. 리스트/그리드 화면에서 권장하는 컬럼 수
  const columns = GRID_COLUMNS[sizeClass];

  // 6. 스크롤 컨테이너에 그대로 끼얹으면 되는 표준 스타일
  //    (width:'100%' + maxWidth 캡 + 가운데 정렬 조합을 화면마다 다시 쓰지 않도록)
  const contentContainerStyle = {
    width: '100%' as const,
    maxWidth: contentMaxWidth,
    alignSelf: 'center' as const,
  };

  // 7. 피그마 기준 반응형 스케일링 함수 (개별 픽셀 값 스케일용 — 컨테이너 너비 캡과는 별개)
  const rw = (width: number) => calculateRW(width, windowWidth);
  const rh = (height: number) => calculateRH(height, windowHeight);
  const rf = (size: number) => calculateRW(size, windowWidth);

  return {
    windowWidth,
    windowHeight,
    sizeClass,
    isCompact,
    contentMaxWidth,
    contentWidth,
    contentContainerStyle,
    screenPadding,
    cardWidth,
    columns,
    rw,
    rh,
    rf,
  };
}
