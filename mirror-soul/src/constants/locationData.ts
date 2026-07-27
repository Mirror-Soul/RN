/**
 * 발견 탭 지역 선택 모달에서 사용하는 시/도 - 구/군 데이터.
 * 추후 실제 지역 코드 API 연동 시 이 상수를 서버 응답으로 교체합니다.
 */
export const LOCATION_DATA: Record<string, string[]> = {
  서울특별시: ['강남구', '성동구', '마포구', '서초구', '송파구', '강서구'],
  경기도: ['성남시', '수원시', '용인시', '안양시'],
  부산광역시: ['해운대구', '남구', '수영구'],
};

export const MAX_SELECTABLE_LOCATIONS = 3;
