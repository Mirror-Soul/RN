import { FontFamily, FontSize, FontWeight, Radii } from '@/src/constants/theme';
import { TextStyle, ViewStyle } from 'react-native';

/**
 * 발견/성장/기록/매칭 4개 메인 탭 헤더가 공통으로 쓰는 스타일.
 *
 * 이전에는 헤더마다 타이틀 폰트 크기(xxl vs xxxl), 이탤릭 여부, 자간,
 * 아이콘 버튼 테두리 두께(1 vs 0.612)가 제각각이었다. 여기서 한 번만
 * 정의하고 4개 헤더가 재사용하면, 다음에 스타일을 바꿀 때 한 곳만 고치면 된다.
 */
export const tabHeaderStyles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  } as ViewStyle,
  title: {
    fontFamily: FontFamily.sans,
    fontStyle: 'italic',
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -1.13,
  } as TextStyle,
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
};
