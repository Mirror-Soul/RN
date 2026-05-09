import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 피그마 디자인 기준 사이즈 (iPhone 14/15 Pro 등 최신 표준)
const FIGMA_WIDTH = 392.927;
const FIGMA_HEIGHT = 852;

/**
 * 피그마 기준 너비(width) 대비 현재 기기의 너비 비율을 적용한 수치를 반환합니다.
 * @param width 피그마 디자인상의 px 값
 * @returns 기기 대응 너비 px 값
 */
export const rw = (width: number): number => {
  const percentage = (width / FIGMA_WIDTH) * 100;
  const responsiveWidth = (percentage * SCREEN_WIDTH) / 100;
  return PixelRatio.roundToNearestPixel(responsiveWidth);
};

/**
 * 피그마 기준 높이(height) 대비 현재 기기의 높이 비율을 적용한 수치를 반환합니다.
 * @param height 피그마 디자인상의 px 값
 * @returns 기기 대응 높이 px 값
 */
export const rh = (height: number): number => {
  const percentage = (height / FIGMA_HEIGHT) * 100;
  const responsiveHeight = (percentage * SCREEN_HEIGHT) / 100;
  return PixelRatio.roundToNearestPixel(responsiveHeight);
};

/**
 * 폰트 크기를 기기 너비 비율에 맞춰 반환합니다.
 */
export const rf = (size: number): number => rw(size);
