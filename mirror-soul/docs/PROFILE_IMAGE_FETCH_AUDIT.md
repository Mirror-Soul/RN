# 프로필 이미지 조회 점검 및 백엔드 요청

## 최신 확인 — 2026-10-08, 백엔드 `a89a8cf`

백엔드 로컬 `main`을 `origin/main`과 동일한 `a89a8cf38e4e615d1ad3c985866aed5b47b8a461`로 fast-forward했다. 로컬 미추적 `docs/value-balance-game-spec.md`는 보존했고 백엔드 소스는 직접 편집하지 않았다. 아래 10월 7일의 미적용 목록은 이번 수정으로 해결됐다.

| 조회 화면 | 현재 코드 연결 |
| --- | --- |
| 상대 상세 | `RecommendationDetailService` → `ProfileImageUrlService.resolve(target)` |
| 받은 신청·신청 상세 | `MeetingService` → 공통 resolver |
| 메시지 목록·채팅방 헤더·더보기 | `ChatService` → 공통 resolver |
| 기록 목록·상세·더보기 | `HistoryService`의 두 응답 매핑 → 공통 resolver |
| 트윈 매칭 프로필 사진 | `MatchService` → 공통 resolver |
| 내 프로필·내 공개 미리보기·사진 수정 응답·추천 목록 | 기존 `FileService.createPresignedDownloadUrlOrFallback()` 연결 유지 |

공통 resolver는 저장된 objectKey로 GET 다운로드 서명을 생성한다. 응답 필드 `profileImageUrl`은 그대로이며 RN의 이미지 컴포넌트·재조회·같은 사진의 서명 유지 처리와 호환된다. 상세 API가 정상 서명을 반환하므로 RN의 추천 페이지 추가 조회는 일반적인 경우 실행되지 않는다.

검증 결과:

- [해당 커밋 배포 작업](https://github.com/Mirror-Soul/Mirror-Soul-Backend/actions/runs/37722910655)의 빌드·파일 복사·EC2 배포 단계 성공을 확인했다.
- 운영 `https://api.mirrorsoul64.com/v3/api-docs` HTTP 200. 위 이미지 조회 경로와 신규 `/evolve/sync-detail` 경로, `profileImageUrl` 문자열 응답 필드가 등록돼 있다. OpenAPI 등록은 실제 회원 사진의 S3 다운로드 성공 검증과 구분한다.
- 토큰 없는 추천 API 읽기 요청은 HTTP 403으로 거절됐다. 서버가 접근 가능하고 해당 요청이 인증 없이 허용되지 않는다는 확인이며, 인증된 회원 조회 성공으로 해석하지 않는다.
- RN 관련 기존 테스트 8개 묶음·57개 통과. 이번 점검에서 RN 앱 코드는 수정하지 않았다.
- 백엔드 관련 기존 테스트 49개 중 48개 통과. `ProfileServiceTest.getMyProfileReturnsProfileImageUrl()` 1개 실패: 실제 서비스가 새 `FileService.createPresignedDownloadUrlOrFallback()`을 호출하지만 이 테스트의 FileService mock 반환값이 설정되지 않아 `null`이 반환된다. 해당 mock 설정/실제 fallback 사례를 보완할 필요가 있다. 백엔드 테스트를 직접 수정하지 않았다.
- objectKey가 없거나 빈 이전 사진은 공통 helper가 여전히 원본 주소를 반환한다. 비공개 파일이라면 데이터 복구가 필요하며, 삭제된 S3 객체·키/버킷 권한 문제도 URL 서명만으로 해결되지는 않는다.
- 새 `/evolve/sync-detail`은 얼굴·목소리·프로필·데이터 신뢰도·감점·계산 버전의 세부 유사도 값을 제공한다. 현재 RN은 기존 `/evolve`의 전체 싱크로율만 사용하며 새 세부 조회는 아직 연동하지 않는다.

확인 범위는 소스·배포 작업·공개 운영 API 문서·기존 단위 테스트다. 실제 로그인된 회원의 API 응답과 사진 다운로드는 기기에서 확인해야 한다. 부모 RN 저장소의 백엔드 submodule 포인터는 커밋하지 않았다.

## 최신 요약 — 2026-10-07, 백엔드 `0f45c02`

아래 이전 점검 기록보다 이 요약을 우선한다. 내 프로필·내 상세·사진 수정 응답·추천 목록에는 다운로드 서명이 적용됐다. 다음 응답은 아직 저장된 영구 S3 URL을 그대로 반환하므로 비공개 사진을 안정적으로 표시하려면 서버 처리가 필요하다.

| 화면 | API | 수정 대상 |
| --- | --- | --- |
| 상대 상세 | `GET /home/recommendations/{uuid}` | `RecommendationDetailService` |
| 받은 신청·신청 상세 | `GET /match/meeting/requests` | `MeetingService` |
| 메시지 목록·채팅방 헤더·더보기 | `GET /chat/rooms` | `ChatService` |
| 기록 목록 | `GET /history/calls` | `HistoryService` |
| 기록 상세·상단/더보기 | `GET /history/calls/{id}/talk-logs` | `HistoryService` |
| 트윈 매칭 응답 | `GET /match/twins` | `MatchService` |

모든 매핑에서 `FileService.createPresignedDownloadUrlOrFallback(user.getProfileImageObjectKey(), user.getProfileImageUrl())` 또는 같은 공통 resolver를 사용하고, 필드 이름은 `profileImageUrl`을 유지하면 된다. DB에는 서명 URL을 저장하지 않는다. objectKey가 없는 이전 데이터는 버킷/객체를 검증해 복구해야 하며, 현재 helper는 key가 없으면 서명 없는 주소를 반환한다.

RN은 같은 사진에 이미 발급된 유효한 추천 서명을 재사용할 수 있지만, 목록에 없는 상대·변경된 사진·만료·과거 기록까지 해결하는 대체 서버 계약은 아니다. 추천의 서명 생성도 정렬·페이지네이션 뒤 실제 응답 회원만 처리하는 것이 효율적이다.

최종 RN 검증: 110개 묶음·747개 테스트, 변경 파일 ESLint, iOS·Android 번들 생성 및 diff 검사 통과. TypeScript의 기존 오류 26개 외 새 오류 없음. 인증된 운영 API/S3 다운로드와 기기별 육안 검증은 별도로 필요하다. 백엔드·AI·인프라는 수정하지 않았다.

## 이전 점검 기록

점검일: 2026-10-06. RN 브랜치: `codex/call-entry-connected-ux`.
백엔드는 `origin/main`을 fetch하여 **`5b78878` (PR #195, 실제 수정 `eeae8ba`)** 소스를 읽었다. 로컬 백엔드 체크아웃/소스 및 submodule 포인터는 변경하지 않았다. 아래는 소스 확인 결과이며, 인증된 운영 API 응답이나 S3의 실제 HTTP 오류는 직접 검증하지 않았다.

## 원인과 최신 수정 범위

서버는 업로드 검증 후 영구 S3 주소와 objectKey를 저장한다. 비공개 버킷의 이 영구 주소를 그대로 RN에 주면 일반 이미지 요청으로는 열 수 없다. RN의 API 인증 토큰은 S3 다운로드 권한을 대신하지 않으며, PUT 업로드 서명도 GET 다운로드 서명으로 쓸 수 없다.

이번 서버 수정은 `FileService.createPresignedDownloadUrlOrFallback(objectKey, fallbackUrl)`로 다운로드 서명을 생성한다. `ProfileService`와 `MyProfileDetailService`에는 적용했지만, **상대 사진을 반환하는 서비스들은 아직 `User.getProfileImageUrl()`을 그대로 반환한다.** 따라서 내 사진이 고쳐져도 추천·상대 상세·받은 신청·채팅·기록 사진이 함께 고쳐지는 수정은 아니다.

`AwsS3Properties`의 기본 다운로드 URL 유효기간은 5분이다. 배포 설정에서 달라질 수 있다. objectKey가 없는 이전 데이터에는 helper가 영구 URL만 반환하므로, 오래된 사진도 필요한 경우 서버에서 objectKey를 복구해야 한다.

## 화면/API별 확인

| RN 화면/데이터 | API | 최신 백엔드 상태 | 필요한 처리 |
| --- | --- | --- | --- |
| 프로필 상단·회원가입 등록 사진·내 사진 크게 보기 | `GET /my-page`, `PATCH /my-page/profile-image` | 다운로드 서명 적용 완료 | 최신 서버 배포 확인, RN 재조회/다운로드 재시도 |
| 내 공개 프로필 미리보기 | `GET /my-page/profile` | 다운로드 서명 적용 완료 | 최신 URL 반영 및 재조회. 현재 트윈 상태 화면은 이 API의 성향·음성 정보를 사용하며 별도의 프로필 사진 영역은 없음 |
| 추천 카드·추천 사진 크게 보기 | `GET /home/recommend` | `RecommendService`에서 영구 URL 반환 | 추천 결과 페이지에만 GET 서명 생성 |
| 상대 상세 | `GET /home/recommendations/{uuid}` | `RecommendationDetailService`에서 영구 URL 반환 | 기존 접근 권한 검증 후 GET 서명 생성 |
| 받은 신청·신청 상세 | `GET /match/meeting/requests` | `MeetingService`에서 영구 URL 반환 | 신청자 사진 GET 서명 생성 |
| 메시지 목록·채팅방 헤더·더보기 프로필 | `GET /chat/rooms` | `ChatService`에서 영구 URL 반환 | 실제 접근 가능한 방의 상대 사진 GET 서명 생성 |
| 기록 목록 | `GET /history/calls` | `HistoryService`에서 영구 URL 반환 | 통화 상대 사진 GET 서명 생성 |
| 기록 상세·상단/더보기 상대 사진 | `GET /history/calls/{id}/talk-logs` | `HistoryService`에서 영구 URL 반환 | 통화 접근 권한 검증 후 상대 사진 GET 서명 생성 |
| 트윈 매칭 응답 | `GET /match/twins` | `MatchService`에서 영구 URL 반환 | 동일 resolver 적용. 현재 받은 신청/메시지 화면의 직접 데이터 출처와는 별도 계약 |

## RN에 적용한 복구

- 내 프로필 쿼리는 만료 가능한 URL에 맞춰 재마운트 시 재조회한다. 내 사진 크게 보기도 열 때 최신 URL을 요청한다.
- 내 사진 크게 보기는 서명이 바뀌어도 Native Modal을 재마운트하지 않고 이미지만 교체한다. 이전 URL/재시도 요청에서 늦게 온 load/error는 새 사진을 덮어쓰지 못한다.
- 추천 카드와 크게 보기에 별도 사진 재시도를 제공한다. 재조회는 이미 노출된 회원의 기존 상세 API를 사용하고, 반환된 사진만 추천 캐시에 병합한다. 사진 재시도로 추천 순서·현재 카드·스와이프 기록을 바꾸지 않는다. 로그인 계정 변경 뒤 도착한 응답은 적용하지 않는다.
- 매칭 공통 아바타, 기록 아바타, 채팅 헤더와 더보기 사진은 실패하면 재시도 버튼을 제공한다. 각 화면의 원래 목록/프로필 API를 다시 조회하므로 새 서명이 실제 이미지에 반영된다. 채팅의 사진 재시도는 메시지 API가 아니라 방 메타데이터 API를 사용한다.
- URL과 요청 회차를 구분하여 같은 URL 재시도도 새 이미지 요청으로 처리한다. 이전 회원/이전 사진의 늦은 오류를 무시하고, 연타 및 화면 이탈 후 상태 갱신을 방지한다.
- API 없이 기본 아바타를 실제 회원 사진으로 꾸미거나, S3 서명을 추측해서 만들거나, 버킷 권한을 바꾸지 않았다. 다운로드 실패를 사진 미등록과 구분한다.
- 기존 등록 미리보기의 4:5/추천 카드 4:3/원형 사진 구도는 유지한다. 재시도 버튼은 기존 스크롤 영역에 배치하고 크게 보기의 긴 오류 내용도 스크롤로 접근할 수 있게 한다.

**RN 복구가 남아 있는 서버의 영구 S3 주소 문제를 해결한 것은 아니다.** 비공개 파일을 실제로 열 수 있게 하려면 위 상대 조회 API들에서도 유효한 다운로드 URL을 제공해야 한다.

## 백엔드 엔지니어 요청안

1. 모든 응답의 `profileImageUrl`을 기존 `FileService` helper 또는 공통 프로필 이미지 resolver로 생성한다. 서비스마다 raw URL/서명 URL 의미가 달라지지 않게 통일한다. RN 필드 이름은 그대로 유지할 수 있다.
2. 추천은 후보 전체가 아니라 **정렬·페이지네이션 후 실제 응답에 들어가는 회원만** 서명한다. 채팅/기록의 중복 회원도 요청 단위로 재사용하면 불필요한 서명 생성이 줄어든다.
3. DB에는 영구 objectKey를 유지하고 만료되는 서명 URL을 저장하지 않는다. 기존 objectKey 누락 데이터는 검증 가능한 버킷 주소를 기준으로 서버에서 복구한다. 실패 시 잘못된 사진이나 다른 회원 사진으로 대체하지 않는다.
4. 회원 상태·차단·추천 노출 이력·채팅방/통화 소유권 검증은 유지한다. 업로드용 URL을 재활용하거나 RN이 임의 키를 다운로드하는 방식으로 우회하지 않는다.
5. 필요하면 URL과 함께 만료 시각(`profileImageExpiresAt`)을 추가해 갱신 시점을 명시한다. 현재 필드만으로도 이미지 표시는 가능하며 이 필드가 RN 수정의 필수 전제는 아니다.
6. 인증된 응답에서 `profileImageUrl`이 GET 서명인지 확인하고, 실제 기기에서 다운로드 200/image Content-Type, 만료 후 새 URL 조회, 사진 교체/삭제, objectKey가 없는 이전 회원을 확인한다. 병합과 실제 배포 완료를 구분한다.

백엔드 코드는 이 작업에서 수정하지 않았다. AI/인프라 변경이나 S3 공개 접근 허용도 필요 작업으로 간주하지 않는다.

소스 근거: 백엔드 `5b78878`의 `FileService`, `ProfileService`, `MyProfileDetailService`, `RecommendService`, `RecommendationDetailService`, `MeetingService`, `ChatService`, `HistoryService`, `MatchService`, `AwsS3Properties`.

검증: 전체 Jest 109개 묶음·736개 테스트 통과. API 재조회 연타, 같은 URL 재시도, 갱신된 서명에 이전 다운로드 오류가 남지 않음, 계정 변경 뒤 캐시 갱신 차단, 추천 사진만 병합하여 목록 순서 유지, 내 사진 모달 유지, 기존 통화·채팅·등록 기능의 회귀를 확인했다. 변경 파일 ESLint 통과, 기존 TypeScript 오류 26개 외 새 오류 없음. 인증된 배포 API/S3의 실제 다운로드 및 모든 기기의 육안 검증은 수행하지 않았다.

## 2026-10-07 재점검

- 최신 원격은 `0f45c02`(PR #196, 실제 수정 `53798d1`)이다. 추천 목록의 `RecommendService`에 다운로드 서명 생성이 추가됐다. 상대 상세의 `RecommendationDetailService`는 여전히 영구 S3 URL을 반환한다. 받은 신청·채팅·기록·트윈 매칭도 이전 표의 미적용 상태가 유지된다.
- [배포 작업 #93](https://github.com/Mirror-Soul/Mirror-Soul-Backend/actions/runs/37438720381)의 동일 커밋 빌드·파일 복사·EC2 배포 단계가 모두 성공한 것을 GitHub Actions에서 확인했다. 앱의 로컬 `.env` 대상은 `https://api.mirrorsoul64.com`이다. 실행 중인 서버의 커밋 값이나 로그인된 실제 이미지 응답은 직접 확인하지 않았으므로 배포 작업 성공과 실제 S3 다운로드 검증을 구분한다.
- RN의 이전 사진 재시도는 상세 API에서 받은 영구 URL을 정상적인 추천 서명 URL 위에 덮어쓸 수 있었다. 상대 상세 화면도 상세 응답 도착 시 서명 있는 목록 사진을 영구 URL로 바꿨다. 따라서 추천 서버 수정만으로 모든 화면이 함께 정상화되지는 않는다.
- RN은 **같은 버킷 호스트·같은 사진 객체**에 대해 목록/캐시에 이미 있는 유효한 서버 서명을 유지한다. 상세가 삭제(`null`)를 명시하거나 다른 사진을 반환하면 이전 사진을 되살리지 않는다. 서명 쿼리는 수정하지 않고, 유효기간은 응답의 AWS 서명 메타데이터로 판단한다.
- 갱신할 때는 먼저 기존 상세 API의 접근 권한·회원 UUID를 확인한다. 상세가 아직 서명을 제공하지 않으면 해당 회원이 들어 있던 추천 페이지와 이미 읽었던 앞쪽 페이지에서 서버가 제공한 새 주소를 찾는다. 결과는 사진 필드만 캐시에 병합하며 추천 순서·페이지·스와이프 위치는 유지한다. 상세에 향후 서명이 적용되면 이 추가 조회는 필요 없어진다.
- 추천/상대 상세에서 오래된 S3 주소나 만료된 사진을 한 번 자동 복구하고, 동일 사진이 계속 실패하면 반복 자동 호출 없이 수동 재시도를 유지한다. 상대 상세의 동시 재시도는 같은 요청을 공유한다.
- objectKey가 없는 예전 회원, 삭제된 S3 파일, 잘못된 키/버킷 권한은 여전히 서버에서 확인해야 한다. 노출 목록에 없는 과거 상대의 주소를 갱신하거나 신규 사진을 항상 표시하려면 상대 상세·채팅·기록에서도 공통 다운로드 resolver가 필요하다.
- `RecommendService`는 현재 정렬·페이지네이션 전 후보 매핑에서 서명을 만든다. 기존 요청안처럼 실제 응답 페이지의 회원만 서명하도록 옮기면 불필요한 생성 비용을 줄일 수 있다. 백엔드는 수정하지 않았다.
