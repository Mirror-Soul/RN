import { MBTI_AXES } from './mbtiAxes';

describe('MBTI_AXES', () => {
  it('pairs each score field with its own letter on the left and the opposite letter on the right', () => {
    // 방향이 뒤집히기 가장 쉬운 지점 — MbtiSelector.tsx의 저장 동작을 직접 추적해서 확정한 매핑.
    // ieScore가 높을수록 I, nsScore가 높을수록 N, ftScore가 높을수록 F, pjScore가 높을수록 P.
    expect(MBTI_AXES).toEqual([
      ['ieScore', 'I', 'E'],
      ['nsScore', 'N', 'S'],
      ['ftScore', 'F', 'T'],
      ['pjScore', 'P', 'J'],
    ]);
  });
});
