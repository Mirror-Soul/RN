import type { MbtiIndicators } from '@/src/types/api/home';

/**
 * MbtiProfile.{ieScore,nsScore,ftScore,pjScore}는 각각 "축 이름의 첫 글자 쪽으로 얼마나
 * 기울었는지"를 뜻한다(ieScore 높음=I, nsScore 높음=N, ftScore 높음=F, pjScore 높음=P) —
 * 온보딩 캡처 코드(MbtiSelector.tsx)의 실제 저장 동작을 직접 추적해서 확정한 방향이다.
 * 방향이 뒤집히기 가장 쉬운 지점이라 컴포넌트 파일이 아닌 별도 모듈로 분리해 코드로 고정한다.
 */
export const MBTI_AXES: [field: keyof MbtiIndicators, left: string, right: string][] = [
  ['ieScore', 'I', 'E'],
  ['nsScore', 'N', 'S'],
  ['ftScore', 'F', 'T'],
  ['pjScore', 'P', 'J'],
];
