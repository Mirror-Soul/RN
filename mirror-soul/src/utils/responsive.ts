import { PixelRatio } from 'react-native';

// 피그마 디자인 기준 사이즈 (iPhone 14/15 Pro 등 최신 표준)
const FIGMA_WIDTH = 392.927;
const FIGMA_HEIGHT = 852;

/**
 * 피그마 기준 너비 대비 기기 너비 비율 수치 계산 (순수 함수)
 */
export const calculateRW = (width: number, screenWidth: number): number => {
  const percentage = (width / FIGMA_WIDTH) * 100;
  const responsiveWidth = (percentage * screenWidth) / 100;
  return PixelRatio.roundToNearestPixel(responsiveWidth);
};

/**
 * 피그마 기준 높이 대비 기기 높이 비율 수치 계산 (순수 함수)
 */
export const calculateRH = (height: number, screenHeight: number): number => {
  const percentage = (height / FIGMA_HEIGHT) * 100;
  const responsiveHeight = (percentage * screenHeight) / 100;
  return PixelRatio.roundToNearestPixel(responsiveHeight);
};
