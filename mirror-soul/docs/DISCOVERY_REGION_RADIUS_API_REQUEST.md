# Discovery "내 동네 설정"(지역 반경 선택) — 백엔드 API 요청 정리

작성일: 2026-09-10 (`feat/discovery-region-radius-map`, `feat/discovery-real-data`에서 분기)

이 문서는 프론트(`mirror-soul`)가 담당하지 않는 백엔드 변경 사항을 백엔드 엔지니어에게
그대로 전달하기 위한 스펙이다. **프론트는 이 문서의 API 계약이 확정/구현된 이후 실제
연동을 진행하며, 백엔드 코드는 이 세션에서 직접 수정하지 않는다.**

## 배경

Discovery(발견) 탭의 "선호 지역" 설정을 당근마켓의 "내 동네 설정"과 동일한 UX로 개편한다 —
실제 지도(Google Maps) 위에 반경을 원으로 시각화하고, "가까운 동네 ↔ 먼 동네" 슬라이더로
그 범위를 조절한다.

### 확정된 제품 결정 (이 문서의 전제)

| 항목 | 결정 |
|---|---|
| 반경의 성격 | **하드 필터** — 범위 밖 사용자는 추천 목록에서 아예 제외 (기존처럼 점수만 깎는 소프트 랭킹 아님) |
| 반경 단위 | **포함 동(읍면동) 개수** 기준 (예: "22개") — km 거리 기준 아님 |
| 앵커(기준 동네) 개수 | 이번 phase는 **1개만** 지원. 기존 "구 최대 3개" 정책은 폐기. (최대 3개 앵커로의 확장은 추후 별도 작업 — 이번 스펙엔 반영하지 않음) |
| 앵커 설정 방법 | 동 이름 검색 **또는** 지도 탭/드래그로 직접 지정 — 둘 다 지원 |
| "근처 동 목록+거리" 계산 위치 | **클라이언트** — 앱이 좌표 포함 전국 동 목록을 1회 받아 캐싱하고, 슬라이더 조작마다 기기에서 즉시 거리 계산·정렬 (서버 왕복 없음) |
| 지도 SDK | Google Maps (`react-native-maps`) — 모바일 네이티브 SDK라 지도 표시 자체는 무료 |

### 기존 구조와의 차이

지금은 "선호 지역"이 **구(sigungu) 단위, 최대 3개, 완전 독립 다중선택**이고
(`HomeService.updatePreferredRegions`), 추천 점수에 10%만 반영되는 **소프트 랭킹
요소**다(`RecommendationScoreCalculator.regionScore()`). 이번 개편은 이걸 **동
단위 앵커 + 반경 = 하드 필터**로 완전히 대체한다.

---

## 0. 가장 먼저 확인·실행해야 할 것 (블로킹)

`Region` 테이블(`mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/domain/Region.java`)에
동(읍면동) 단위 `latitude`/`longitude` 컬럼이 이미 있고, 이걸 채우는 배치
(`RegionGeocodingBatch`, 앱 기동 시 1회 실행되는 `ApplicationRunner`)도 이미 구현돼 있다.
**단, `application.yaml`의 `region.geocoding.enabled` 기본값이 `false`라 실제 운영 DB에
좌표가 채워졌는지 이번 조사로는 확인할 수 없었다.**

**요청**: 아래를 먼저 확인해달라.

```sql
SELECT COUNT(*) AS total,
       COUNT(*) FILTER (WHERE latitude IS NULL OR longitude IS NULL) AS missing_coords
FROM region;
```

- `missing_coords`가 0이 아니면, 환경변수 `REGION_GEOCODING_ENABLED=true` +
  `KAKAO_REST_API_KEY`를 설정하고 앱을 한 번 재기동하면 된다 (이미 구현된 배치가
  `latitude IS NULL OR longitude IS NULL`인 행만 골라 Kakao 주소 검색 API로 채운다 —
  새로 만들 코드 없음). 카카오 API 특성상 리단위 통폐합 등으로 일부는 매칭 실패할 수
  있으니, 배치 로그의 `success`/`failure` 카운트를 확인할 것.
- 이 데이터가 없으면 이번 기능 전체가 동작할 수 없으므로 최우선 확인 사항이다.

---

## 1. 데이터 모델 변경

### 1.1 신규 테이블: `user_preferred_region`

기존 `user_preferred_sigungu`(M:N, 최대 3행)와 달리 이번엔 **사용자당 최대 1행**이다.

```sql
CREATE TABLE user_preferred_region (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE REFERENCES users(id),
    anchor_region_id BIGINT NOT NULL REFERENCES region(id),
    nearby_count     INT NOT NULL,
    created_at       TIMESTAMP NOT NULL,
    updated_at       TIMESTAMP NOT NULL
);
```

`user_id UNIQUE` 제약으로 "사용자당 1개" 카디널리티를 DB 레벨에서 보장한다. 설정 변경은
UPDATE(또는 delete+insert)로 처리 — 기존 `HomeService.updatePreferredRegions()`가 매번
`deleteAllByUserId` 후 `saveAll`하던 것과 달리, 이번엔 단일 행이라 upsert 한 번이면 된다.

### 1.2 기존 `sigungu` / `user_preferred_sigungu` 테이블은?

**삭제하지 말고 일단 그대로 둘 것을 제안한다.** 이유는 §4(마이그레이션) 참고 — 새 기능이
안정화된 뒤 별도 정리 PR에서 제거하는 게 안전하다. 다만 §3.3에서 설명하듯
`RecommendationScoreCalculator`가 이 테이블을 참조하는 코드는 이번 작업으로 제거된다.

---

## 2. 신규/변경 API 엔드포인트

### 2.1 `GET /regions/coordinates` (신규) — 좌표 포함 전국 동 목록 벌크 조회

프론트가 앱 시작 시(또는 이 화면 진입 시) 1회 호출해 캐싱하고, 슬라이더 조작마다
클라이언트에서 이 목록으로 거리 계산을 한다. **인증 불필요** (기존
`/onboarding/regions/sido` 등과 같은 공개 API 컨벤션).

```java
public record RegionCoordinateDTO(
    Long regionId,
    String sidoName,
    String sigunguName,
    String eupmyeondongName,
    BigDecimal latitude,
    BigDecimal longitude
) {}
```

- `latitude`/`longitude`가 `NULL`인 행(geocoding 실패분)은 **응답에서 제외**할 것 —
  클라이언트가 null 처리를 신경 쓰지 않아도 되게.
- 전국 기준 약 수천 건 예상 — 페이지네이션 없이 통째로 내려줘도 되는 규모라고 판단했다
  (프론트에서 react-query로 `staleTime`을 길게 잡아 캐싱 예정, 거의 정적 데이터라
  자주 안 바뀜).
- 어디에 둘지: 기존 시도/시군구/읍면동 목록 API가 이유 없이 `OnboardingController`
  아래(`/onboarding/regions/*`)에 있다. 이번 것도 일단 같은 곳에 추가해도 되고
  (`/onboarding/regions/coordinates`), 이 기회에 별도 `RegionController`로 분리해도
  된다 — **필수 아님, 백엔드 엔지니어 재량.**

### 2.2 `GET /regions/search?keyword=` (신규) — 동 이름 검색(자동완성)

앵커를 검색으로 찾을 때 쓴다. 기존 시도→구→동 3단계 계층 탐색 대신, 동 이름으로 바로
검색한다 (예: "부곡" 입력 → "부산광역시 금정구 부곡동" 등 매칭 결과).

```java
public record RegionSearchResultDTO(
    Long regionId, String sidoName, String sigunguName, String eupmyeondongName
) {}
```

- `WHERE eupmyeondong_name LIKE '%:keyword%' OR sigungu_name LIKE '%:keyword%'` 정도의
  단순 부분일치로 충분해 보인다 (전국 데이터가 수천 건 규모라 성능 이슈 없음). 결과가
  너무 많으면 상위 N개(예: 20개)만 반환.
- 프론트에서 타이핑마다 호출하지 않도록 디바운스 처리할 예정 — 백엔드는 별도 rate
  limit을 걱정할 필요는 없어 보이지만, 인증 없는 공개 API이니 남용 방지가 필요하면
  알려달라.

### 2.3 `PUT /home/preferred-region` (기존 `/home/preferred-regions` 대체)

```java
public record UpdatePreferredRegionDTO(
    @NotNull(message = "기준 지역은 필수입니다.")
    Long anchorRegionId,

    @NotNull(message = "포함할 동 개수는 필수입니다.")
    @Min(value = 1, message = "최소 1개 이상이어야 합니다.")
    @Max(value = 50, message = "최대 50개까지 설정할 수 있습니다.") // 상한선은 §5 참고, 논의 필요
    Integer nearbyCount
) {}
```

응답은 서버가 실제로 계산한 결과를 그대로 확인시켜주는 형태를 제안한다 (프론트가 지도에
"이 N개 동이 포함됩니다"를 정확히 표시하려면 서버 계산 결과와 클라이언트 계산 결과가
어긋나지 않는지 확인할 수단이 필요함):

```java
public record PreferredRegionDTO(
    Long anchorRegionId,
    String sidoName,
    String sigunguName,
    String eupmyeondongName,
    Integer nearbyCount,
    List<Long> includedRegionIds // 앵커 자신 포함, 실제로 필터에 쓰이는 최종 ID 목록
) {}
```

- `anchorRegionId`가 존재하지 않으면 기존 컨벤션대로 `REGION_NOT_FOUND`(404) 반환.
- 기존 `GET /home` 응답의 `preferredRegions: PreferredRegionDTO[]`(리스트)를
  `preferredRegion: PreferredRegionDTO | null`(단일, 미설정 시 null)로 바꾸는 걸
  제안한다 — 별도 `GET /home/preferred-region` 엔드포인트를 새로 안 만들어도 기존
  `GET /home` 하나로 충분해 보인다. (새 GET을 따로 원하면 그래도 무방 — 취향 차이)

### 2.4 폐기 대상

- `GET /onboarding/regions/sigungu`, `GET /home/preferred-regions/options` — 구 단위
  선택 UI가 없어지므로 프론트에서 더 이상 호출하지 않는다. **다만 다른 화면(예:
  온보딩의 "내 주소" 설정)이 이 API를 재사용하고 있는지는 백엔드 엔지니어가 실제
  사용처를 grep해서 확인해달라** — 이번 조사에서는 Discovery 쪽 사용처만 확인했다.
  다른 곳에서 안 쓰면 삭제, 쓰고 있으면 그대로 유지.

---

## 3. 하드 필터 반영 — `RecommendService` 변경

### 3.1 후보 조회 쿼리에 조건 추가

현재 쿼리 (`mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/repository/UserRepository.java:42-97`,
`findRecommendationCandidates`)는 성별/성인여부/활동여부/차단/미팅/스와이프 조건만 있고
지역 조건이 전혀 없다. 아래 조건을 추가할 것을 제안한다:

```java
and (
    :includedRegionIds is null
    or candidate.residenceRegion.id in :includedRegionIds
)
```

메서드 시그니처에 파라미터 추가:

```java
List<User> findRecommendationCandidates(
        @Param("currentUserId") Long currentUserId,
        @Param("currentUserGender") Gender currentUserGender,
        @Param("adult") boolean adult,
        @Param("adultBirthDateCutoff") LocalDate adultBirthDateCutoff,
        @Param("activeSince") LocalDateTime activeSince,
        @Param("swipedSince") LocalDateTime swipedSince,
        @Param("includedRegionIds") Collection<Long> includedRegionIds // 신규
);
```

**`includedRegionIds`가 `null`이면 필터링을 안 하도록** 짠 이유는 §4(마이그레이션)의
"아직 내 동네를 설정 안 한 사용자는 기존처럼 전국 노출" 정책 때문이다 — 반드시 이
null 처리 분기를 유지해달라.

### 3.2 "가장 가까운 N개 동" 계산 — 어디서, 어떻게

`RecommendService.getRecommendations()`가 `findRecommendationCandidates`를 호출하기
**전에**, 요청자의 `UserPreferredRegion`을 조회해서 `includedRegionIds`를 계산해야 한다:

1. 요청자의 `UserPreferredRegion` 조회 — 없으면 `includedRegionIds = null`.
2. 있으면: 앵커 `Region`의 좌표 + 좌표가 있는 전체 `Region` 목록을 가져와서
   (`RegionRepository`에 `findAllByLatitudeIsNotNullAndLongitudeIsNotNull()` 같은
   메서드 추가), 앵커 기준 Haversine 거리를 계산 → 오름차순 정렬 → 앵커 자신 + 상위
   `nearbyCount`개의 `Region.id`를 모아 `includedRegionIds`로 사용.
3. 이 로직은 매 추천 조회 요청마다 실행되지만, 전국 `Region` 행이 수천 건 규모라
   메모리 내 계산으로 충분하다 (PostGIS나 SQL 레벨 최적화는 이 데이터 규모에서
   불필요하다고 판단 — 나중에 성능 이슈가 실제로 보이면 그때 최적화).

**중요 — 기존 Haversine 코드 재사용**: `RecommendationScoreCalculator.distanceKm()`
(`mirror-soul-back/.../service/RecommendationScoreCalculator.java:104-115`)에 이미
동일한 Haversine 공식이 private 메서드로 있다. 이번에 새로 만드는 "가장 가까운 N개
찾기" 로직과 계산식이 완전히 겹치므로, **이 공식을 별도 유틸(예:
`GeoDistanceUtils.distanceKm(lat1, lng1, lat2, lng2)`)로 추출해서 두 곳(기존 소프트
스코어링 + 신규 하드 필터)이 공유하도록 리팩터링**해달라. 같은 공식을 두 군데 복붙하면
나중에 한쪽만 고치는 버그가 나기 쉽다.

새 컴포넌트 제안: `com.mirrorsoul.mirrorsoul_api.region.NearbyRegionFinder`
(`region.geocoding` 패키지 옆에 두면 자연스러워 보임), 메서드:
`List<Long> findNearestRegionIds(Region anchor, int count)`.

### 3.3 기존 소프트 랭킹 로직 정리

`RecommendationScoreCalculator.regionScore()`(`mirror-soul-back/.../service/RecommendationScoreCalculator.java:71-93`)는
두 요소를 블렌딩한다: `distanceScore`(순수 exp 거리감쇠)와 `preferredScore`(후보가
"선호 구 목록"에 있으면 1.0, 아니면 0.0 — **기존 구 단위 다중선택** 개념).

- **`preferredScore`(구 일치 바이너리 보너스)는 제거를 제안한다.** 이번 개편으로
  "선호 지역"이라는 개념 자체가 하드 필터로 이동하기 때문에 — 애초에 후보군 자체가
  반경 내로 걸러진 뒤이므로, 그 안에서 다시 "구가 일치하냐"를 따지는 게 의미가 없어짐.
  `calculate()`/`regionScore()` 시그니처에서 `List<Sigungu> requesterPreferredSigungu`
  파라미터 자체를 제거하고, 호출부(`RecommendService.java`의
  `loadPreferredSigungu()`, `UserPreferredSigunguRepository` 의존성)도 함께 정리.
- **`distanceScore`(연속적 exp 감쇠)는 그대로 유지를 제안한다.** 반경으로 걸러진
  후보군 안에서도 "더 가까운 동네일수록 미세하게 더 높은 점수"는 여전히 의미 있는
  신호이고, 이 계산은 앵커가 아니라 두 사용자의 `residenceRegion`(거주지) 좌표를 쓰는
  거라 이번 앵커/반경 기능과 독립적이다 — 손대지 않아도 됨.

---

## 4. 기존 사용자 마이그레이션

`user_preferred_sigungu`에 이미 데이터가 있는 기존 사용자를 새 `user_preferred_region`
으로 자동 변환하는 로직은 **만들지 말 것을 제안한다.** "구" 하나를 대표하는 단일 "동"을
고르는 데 원칙적으로 맞는 기준이 없어서(구 중심에 가장 가까운 동? 인구가 제일 많은 동?
전부 임의적), 잘못된 변환을 하느니 다음 정책을 제안한다:

- 마이그레이션 없이 모든 기존 사용자는 `user_preferred_region`이 없는 상태로 시작.
- §3.1의 null-safe 필터 덕분에, 이 상태의 사용자는 **기존과 동일하게 필터링 없이
  전국 노출**된다 — 즉 이번 배포가 기존 사용자에게 화면이 깨지거나 추천이 갑자기
  0건이 되는 회귀를 일으키지 않는다.
- Discovery 탭 진입 시 "내 동네를 설정해주세요" 유도 UI를 프론트에서 자연스럽게
  보여주는 방식으로 유도 — 이건 프론트 책임이라 백엔드가 신경 쓸 부분 아님.
- 옛 `sigungu`/`user_preferred_sigungu` 테이블과 관련 코드(`HomeService`의
  `updatePreferredRegions`/`getSigunguOptions`, `SigunguRepository`,
  `UserPreferredSigunguRepository`)는 새 기능이 안정화된 뒤 별도 정리 PR에서
  제거를 제안 — 이번 PR 범위에 포함시키지 말 것 (한 PR에서 너무 많은 걸 바꾸면
  리뷰/롤백이 어려워짐).

---

## 5. 엣지 케이스 & 열린 질문 (백엔드 엔지니어와 논의 필요)

1. **`nearbyCount` 상한선**: 위 스펙에서 임의로 50을 넣었는데 근거는 없다. 너무 크게
   허용하면 사실상 "하드 필터 없음"과 비슷해진다 — 적정 상한을 논의해서 정할 것.
2. **저밀도 지역**: 도서산간처럼 동 밀도가 낮은 지역은 "가장 가까운 N개 동"이 수십~
   수백 km 밖일 수 있다. 이걸 그대로 허용할지, 최대 거리 상한(km)을 개수 기준과
   병행할지는 제품 판단이 필요해 보인다 — 일단 이번 스펙엔 거리 상한 없이 순수
   개수 기준으로만 구현하고, 실사용 데이터를 보고 필요하면 추가하는 걸 제안.
3. **앵커 자신의 포함 여부**: 이미지의 "부곡동과 근처 동네 22개"라는 문구는 앵커
   자신은 항상 포함 + 거기에 N개가 "추가"되는 구조로 해석했다 (§2.3의
   `includedRegionIds`도 "앵커 포함"으로 명시함). 이 해석이 맞는지 확인 필요.
4. **좌표 없는 동 처리**: geocoding이 실패한 동(§0)은 검색 결과·앵커 후보·근처 동
   계산에서 전부 제외되는 게 자연스러워 보임 — 별도 처리 로직 불필요, 그냥
   좌표 없는 행을 안 보여주면 됨.
5. **`GET /regions/coordinates`/`GET /regions/search` 인증 여부**: 기존 시도/시군구
   목록 API처럼 비로그인 공개로 둘지 확인 — 이번 스펙은 공개로 가정했다.
6. **온보딩의 `residenceRegion`(내 실제 거주지)과 이번 앵커는 서로 다른 개념**이다 —
   헷갈리지 않게 변수/컬럼명에서 명확히 구분되어 있는지만 리뷰 때 한 번 확인해달라
   (이미 별도 테이블/컬럼이라 실수로 섞일 여지는 적어 보임).

---

## 6. 회의에서 말할 요지

> "Discovery 탭 지역 필터를 당근마켓 '내 동네 설정'처럼 바꾸려고 합니다. 핵심은 세
> 가지예요. 첫째, 지금은 '구 최대 3개'를 소프트 랭킹(점수 10%)으로만 쓰는데, 이제는
> '동 1개(앵커) + 반경'을 **하드 필터**로 씁니다 — 범위 밖은 추천에 아예 안 뜨게요.
> 둘째, 반경은 km가 아니라 '가까운 순으로 N개 동'이라는 개수 기준입니다. 셋째, 이 N개
> 계산은 프론트가 좌표 데이터를 통째로 캐싱해서 클라이언트에서 즉시 하기로 했어요 —
> 그래서 백엔드에 필요한 건 '좌표 포함 동 목록 벌크 조회' API 하나, '동 이름 검색' API
> 하나, 그리고 추천 조회 쿼리에 지역 필터 조건 하나를 추가하는 거예요.
>
> 제일 먼저 확인해주셔야 할 게, Region 테이블에 동 단위 위경도를 채우는 배치가 이미
> 코드에 있긴 한데 기본 설정이 꺼져 있어서, 실제 운영 DB에 좌표가 채워졌는지 모릅니다
> — 이것부터 확인 부탁드려요. 안 채워져 있으면 플래그 하나 켜고 재기동하면 되는
> 수준이라 크게 어려운 작업은 아닐 거예요.
>
> 그리고 기존 사용자 데이터(구 3개 선택)를 새 구조로 억지로 변환하지 말고, 그냥
> '설정 안 한 사용자는 필터링 없음'으로 두고 새로 설정하게 유도하는 쪽으로 가려고
> 합니다 — 어설프게 자동 변환하면 오히려 이상한 매칭이 나올 수 있어서요."

---

## 참고

- 이 문서에서 언급한 기존 코드 위치:
  - `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/domain/{Region,Sigungu,UserPreferredSigungu}.java`
  - `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/service/{HomeService,RecommendService,RecommendationScoreCalculator}.java`
  - `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/repository/UserRepository.java` (`findRecommendationCandidates`)
  - `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/region/geocoding/{RegionGeocodingService,RegionGeocodingBatch}.java`
  - `mirror-soul-back/src/main/resources/application.yaml` (`region.geocoding.*`)
- 프론트 기존 구현(대체 대상): `mirror-soul/src/components/home/main/LocationSelectModal/`,
  `mirror-soul/src/services/homeService.ts`, `mirror-soul/src/types/api/home.ts`
