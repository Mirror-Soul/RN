/** {sidoName, sigunguName}을 "서울 강남구" 형태로 포맷. Discovery 카드/모달 공용. */
export function formatRegion(region: { sidoName: string; sigunguName: string }): string {
  return `${region.sidoName} ${region.sigunguName}`;
}
