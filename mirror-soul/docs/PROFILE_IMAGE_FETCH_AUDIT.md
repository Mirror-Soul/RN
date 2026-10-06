# 프로필 이미지 조회 점검 및 백엔드 요청

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
