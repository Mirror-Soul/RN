# 백엔드 API 구조 분석 리포트 (Phase 1 + 에러코드 검증)

생성일: 2026-07-29 (초판) / 2026-07-29 업데이트: Service 계층 전수 검증 반영 (v1.1.0)
대상: `mirror-soul-back` (Spring Boot, 패키지 `com.mirrorsoul.mirrorsoul_api`)
목적: `mirror-soul`(RN) 프론트엔드와 API 응답/요청 구조를 완벽히 동기화하기 위한 정본(source of truth) 확보. 함께 생성된 `backend-schema.json`의 원자료(raw data)에 대한 해설.

---

## 0. 에러코드 매핑 검증 (v1.1.0)

초판(v1.0.0)의 `possibleErrorCodes`는 컨트롤러/DTO/도메인 이름으로부터의 추론값이었다. 이번 업데이트에서 **19개 Service 클래스 전체**를 읽고, `throw new GeneralException(...)`과 `.orElseThrow(() -> new GeneralException(...))` 호출부 **총 70곳**(`grep`으로 1차 수집 45+25건, 중복 제거)을 하나씩 확인해 어느 컨트롤러 엔드포인트가 그 코드를 실제로 받을 수 있는지 call chain을 따라갔다 (컨트롤러 → Service public 메서드 → 그 메서드가 호출하는 private 헬퍼/다른 Service까지 추적).

**검증 결과, 46개 엔드포인트 중 25개에서 오차가 발견되어 정정했다.** 주요 정정 유형:

1. **가장 흔한 누락 패턴 — 공통 `getUser()`/`requireActiveMember()` 헬퍼를 놓침**: `ProfileController`의 10개 엔드포인트 중 8개가 초판에서 `possibleErrorCodes: []`였지만, 실제로는 전부 `ProfileService`의 private `getUser(userUuid)` 헬퍼를 거치며 `USER_NOT_FOUND`를 던질 수 있다. 이름 기반 추론은 "이 오퍼레이션이 실패할 만한 도메인 이유"만 떠올리고, "이 메서드가 사용자 존재 여부부터 확인한다"는 구현 디테일은 놓치기 쉽다는 걸 보여주는 사례. `ChatController`의 5개 엔드포인트도 동일 패턴(`requireActiveMember`/`requireActiveMemberForUpdate`)이지만 방향이 반대였다 — 초판이 `CHAT_ROOM_NOT_FOUND`를 잘못 추가했었다 (§1 참고).
2. **위임(delegation) 체인을 놓침**: `EvolveController.completeRecording`, `OnboardingController.saveInterviewAnswer`는 각각 `EvolveService`/`InterviewService`가 내부적으로 `FileService.verifyXxxAudioAndBuildFileUrl(...)`을 호출하는데, 이 위임된 메서드가 던지는 `INVALID_PARAMETER`/`S3_CONNECTION_FAILED`를 초판은 전혀 잡아내지 못했다 (둘 다 `[]`였음).
3. **상태 전이 가드(state-guard) 누락**: 온보딩 단계별 API(`postProfile`, `putPersonality`, `saveInterviewAnswer`, `saveVisualFile`)는 전부 "현재 유저 상태가 이 단계에 맞는지"를 확인하고 아니면 `FORBIDDEN`을 던진다 (예: `ONBOARD_A` 상태가 아니면 `postProfile` 실패). 이런 방어적 상태 체크는 도메인 이름만 봐서는 유추하기 어려운 부분이라 초판이 전부 놓쳤었다.
4. **반대 방향 오차 — 실제로는 안 던지는데 있다고 추론한 경우**: `RegionService.getSigunguList`/`getEupmyeondongList`는 없는 지역명을 넣어도 예외 없이 그냥 빈 리스트를 반환한다 (`REGION_NOT_FOUND`는 `OnboardingService.postProfile` 저장 시점에만 쓰인다). `JoinController.sendCode`도 (조사 시점 기준) 이메일 중복 체크를 하지 않는데 초판은 `DUPLICATE_EMAIL`을 추론했었다. **(2026-07-30 갱신) 그 뒤 백엔드 커밋 `1f61d00`(PR #116)로 이 판단 자체가 뒤집혔다** — `EmailAuthService.sendCode()`가 이제 실제로 `DUPLICATE_EMAIL`을 던지도록 바뀌었고(회원가입 폼을 끝까지 채운 뒤에야 이메일 중복을 알게 되던 UX 문제 해결 목적), 대신 `JoinService.basicProfile()`에 있던 동일 체크는 삭제됐다. 스냅샷은 조사 시점의 상태이며 이후 바뀔 수 있다는 점을 보여주는 실제 사례.

정정 내역 전체는 `backend-schema.json`의 각 엔드포인트 `verifiedNote` 필드에 근거(어느 Service 메서드의 몇 번째 줄인지)와 함께 기록되어 있다. 모든 엔드포인트에 `"verified": true`가 표시되어 있으며, 검증되지 않은 채 남은 항목은 없다.

**부가 발견 — 정의만 되고 한 번도 던져지지 않는 에러 코드 9개**: `GeneralErrorCode`의 47개 상수 중 `DUPLICATE_LOGINID`, `UNSUPPORTED_CONTENT_TYPE`, `FILE_EMPTY`, `FILE_TOO_LARGE`, `S3_UPLOAD_FAILED`, `S3_DELETE_FAILED`, `EXTERNAL_SERVICE_TIMEOUT`, `EMAIL_NOT_FOUND`, `CHAT_ROOM_NOT_FOUND` 9개는 컨트롤러·서비스·도메인 엔티티 등 `src/main/java` 전체 어디에서도 참조되지 않는다 (enum 정의부 제외 grep 결과 0건, 전부 확인). `backend-schema.json`의 `unusedErrorCodes`에 정리했다. 이유는 코드마다 다르다 — `FILE_EMPTY`/`FILE_TOO_LARGE`/`S3_UPLOAD_FAILED`는 파일 업로드가 presigned URL 방식(클라이언트가 S3에 직접 PUT)이라 서버가 파일 바이트를 직접 다루는 경로 자체가 없어서고, `CHAT_ROOM_NOT_FOUND`는 "방이 없음"과 "멤버가 아님"을 서버가 구분하지 않고 `CHAT_ROOM_ACCESS_DENIED` 하나로 뭉뚱그려서다. 프론트가 이 9개 코드에 대한 에러 UI를 미리 만들어도 지금은 절대 트리거되지 않는다는 뜻이니, 에러 핸들링 작업 우선순위에서 낮게 잡아도 된다.

---

## 1. 공통 응답 래퍼 — `ApiResponse<T>`

파일: `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/common/apiPayload/ApiResponse.java`

```java
{ isSuccess: Boolean, code: String, message: String, result: T, error: Object }
```

- **TASK 스펙 예시와 다른 점**: 스펙 예시는 `successField/dataField/errorsField/timestamp` 같은 이름을 가정했지만, 실제 필드는 `isSuccess`/`result`/`error`이고 `timestamp`는 아예 없다. 이번 산출물(`backend-schema.json`)은 스펙이 아니라 **실제 코드를 그대로** 반영했다.
- 프론트엔드 `mirror-soul/src/types/api/common.ts:5`의 `ApiResponse<T>` TS 인터페이스가 이미 이 구조와 정확히 일치한다 — FE는 올바르게 맞춰져 있으며, `apiClient.ts`의 응답 인터셉터도 `isSuccess`/`code`/`message`/`error`를 정확히 소비하고 있다.
- **필드 단위 검증 에러 배열이 없다.** `@Valid` 바디 검증 실패(`MethodArgumentNotValidException`) 시 `error` 필드에는 `bindingResult.getAllErrors().get(0).getDefaultMessage()` — 즉 **첫 번째 에러 메시지 하나만** 문자열로 담긴다. 여러 필드가 동시에 잘못됐을 때 사용자에게 한 번에 다 보여줄 수 없다. 폼 단위 실시간 검증 UX가 필요하다면 이는 백엔드 쪽에서 `FieldError` 리스트를 구조화해서 내려주도록 바꿔야 하는 지점이다.
- 성공 코드는 `ApiResponse.onSuccess(...)`가 항상 `GeneralSuccessCode.OK`(`"COMMON2000"`)를 하드코딩한다. `DELETED`(`"COMMON2001"`)는 정의만 있고 실제로 어디서도 호출되지 않는다 — 회원탈퇴(`DELETE /my-page`)조차 `onSuccess("회원 탈퇴가 완료되었습니다.")`로 `OK` 코드를 쓴다.
- **HTTP status 비대칭**: 모든 컨트롤러가 `ApiResponse<T>`를 직접 반환하고 `ResponseEntity`를 쓰지 않는다. 즉 **성공 응답은 예외 없이 전부 HTTP 200**이다 — 리소스 생성(`POST /join/basic-profile`, `POST /match/meeting/requests` 등)도 201이 아니고, 삭제(`DELETE /my-page`, `DELETE /push/devices/{id}`)도 204가 아니다. 반면 실패는 `ExceptionAdvice`가 `ResponseEntity`로 status를 명확히 분기한다. 프론트에서 HTTP status 코드로 분기하는 로직이 있다면 성공 판별은 절대 status가 아니라 `isSuccess` 필드로만 해야 한다 (현재 `apiClient.ts`는 이미 그렇게 되어 있어 안전하다).

## 2. 예외 처리 아키텍처

- 전역 핸들러는 `ExceptionAdvice` (`@RestControllerAdvice(annotations = RestController.class)`) **하나뿐**이고, 커스텀 예외도 `GeneralException`(`RuntimeException` 직속) **하나뿐**이다. 도메인별로 `UserException`, `CallException` 같은 하위 클래스가 전혀 없다 — 모든 서비스 코드가 `throw new GeneralException(GeneralErrorCode.XXX)` 형태로 동일한 예외를 던진다 (전수 조사 결과 throw/orElseThrow 호출부 정확히 70곳, §0 참고).
- 이 구조 자체는 나쁘지 않지만(단순함), 컴파일 타임에 "이 서비스 메서드가 어떤 종류의 에러를 던질 수 있는지"를 타입으로 보장하지 못한다는 트레이드오프가 있다. `backend-schema.json`의 `possibleErrorCodes`는 이제 §0에서 설명한 Service 계층 전수 검증을 거쳐 `"verified": true`로 표시되어 있다.
- 프레임워크 레벨 예외(`MethodArgumentNotValidException` 등 7종)는 모두 `GeneralErrorCode`의 범용 코드(`INVALID_PARAMETER`, `MISSING_PARAMETER`, `API_NOT_FOUND`, `METHOD_NOT_ALLOWED`, `INTERNAL_SERVER_ERROR`)로 하드코딩 매핑되어 있어, 어떤 도메인의 요청이든 검증 실패 시 항상 같은 코드가 내려온다.
- **오분류 발견**: `HttpMediaTypeNotSupportedException`(Content-Type 불일치, 파일 업로드와 무관하게 어떤 요청에서도 발생 가능) 핸들러가 `GeneralErrorCode.UNSUPPORTED_FILE_TYPE`(파일 전용 이름)을 사용한다. 정작 이름이 맞는 `UNSUPPORTED_CONTENT_TYPE`(`REQ_4150`)은 정의만 되어 있고 아무 곳에서도 쓰이지 않는다.

## 3. 에러 코드 인벤토리 (47개, 단일 Enum)

`GeneralErrorCode` 하나에 13개 도메인 접두사(AUTH/REQ/API/FILE/S3/SERVER/USER/REGION/EMAIL/CLONE/CALL/MEETING/CHAT)로 47개 상수가 있다. 전체 목록은 `backend-schema.json`의 `errorCodes` 배열 참고. 특이사항:

- **`CLONE_NOT_FOUND` (CLONE_4000)이 관례를 깬다**: 이름은 `*_NOT_FOUND`인데 상태 코드가 404가 아니라 **400**이다. 같은 파일 안에서 `USER_NOT_FOUND`/`REGION_NOT_FOUND`/`CALL_NOT_FOUND`/`MEETING_REQUEST_NOT_FOUND`/`CHAT_ROOM_NOT_FOUND`는 전부 정확히 404를 쓰고 있어, 이 하나만 벗어난다. 백엔드 코드를 고칠 수 있는 위치라면 404로 통일을 제안할 만하고, 못 고친다면 최소한 프론트 에러 핸들링에서 이 코드만 예외 취급해야 한다.
- **번호 비연속성**: `CALL_` 접두사 안에서 `CALL_NOT_FOUND`가 `CALL_4040`, `CALL_ALREADY_ENDED`가 `CALL_4000`, `INSUFFICIENT_TALK_TIME`이 `CALL_4001`로, enum 선언 순서와 번호 순서가 일치하지 않는다. 기능상 문제는 없지만 코드 리뷰/신규 코드 추가 시 번호 충돌 위험이 있다.
- `UNSUPPORTED_CONTENT_TYPE`(REQ_4150)은 정의만 있고 미사용 (§2 참고).

## 4. `@Valid` 적용 불일치 (요청 검증 공백)

Bean Validation 어노테이션이 붙어 있는데도 컨트롤러 메서드에 `@Valid`가 없어 **실제로는 검증되지 않는** 엔드포인트가 존재한다. `backend-schema.json`에서 `"validationGap": true`로 표시:

| 엔드포인트 | DTO | 상태 |
|---|---|---|
| `POST /join/send-code` | `JoinReqDTO.sendCodeReqDTO` | `@NotBlank`/`@Email`이 있지만 `@Valid` 없음 — 빈 문자열/잘못된 형식 이메일도 그대로 서비스 계층까지 통과 |
| `POST /onboarding/profile/check-dup-nickname` | `OnboardingReqDTO.checkDupNicknameReqDTO` | `@NotBlank`가 있지만 `@Valid` 없음 |

그 외 검증 어노테이션 자체가 아예 없는 DTO(예: `CallReqDTO.StartCallDTO.mediaType`, `CallReqDTO.EndCallDTO.recordingUrl`, `VisualReqDTO`의 두 필드, `JoinReqDTO.verifyCodeReqDTO.code`)는 `@Valid` 유무와 무관하게 검증 자체가 없다 — 이런 필드들은 프론트에서 자체적으로 형식을 보장해야 한다.

## 5. 기타 특이사항

- **`AdminController.checkVerifyJob`(`GET /admin/job-verify`)**: 다른 모든 컨트롤러와 달리 `@SecurityRequirement`도 `@AuthenticationPrincipal`도 없다. 관리자 API인데 코드만 봐서는 인증이 걸려 있는지 알 수 없다 — Spring Security 설정(`SecurityConfig` 등, 이번 조사 범위 밖)을 별도로 확인해야 한다.
- **`CallController.markInProgress`(`PATCH /calls/{call-id}/in-progress`)**: 클래스 레벨 `@SecurityRequirement`는 있지만 메서드 파라미터에 `@AuthenticationPrincipal`이 없다 — 누가 이 통화를 "연결 완료" 처리할 수 있는지가 컨트롤러 코드만으로는 보이지 않는다.
- **`OnboardingController.checkDupNickname`**: 실패해도 예외를 던지지 않고, `isSuccess=true`인 채로 **메시지 문자열**("사용 가능한 닉네임입니다." vs "사용 불가능한 중복 닉네임입니다.")로만 결과를 구분한다. 프론트가 `code`나 `isSuccess`가 아니라 `message` 텍스트를 파싱해야 하는 유일한 엔드포인트 — 프론트 구현 시 반드시 주의할 지점.
- **`ProfileController.buyTime`(`POST /my-page/buy-time`)**: 실제 결제(IAP/PG) 검증 없이 요청받은 초(seconds)만큼 시간을 그대로 더해주는 것으로 보인다. 이는 RN 앱 MVP 감사(별도 세션, `mirror-soul` 저장소 문제 인벤토리 B1/B2)에서 발견한 "결제 없이 무제한 통화 가능" 이슈와 백엔드 쪽에서 정확히 대응되는 지점이다 — 프론트뿐 아니라 백엔드도 실제 IAP 영수증 검증을 붙이기 전까지는 이 엔드포인트를 신뢰할 수 없다.
- **`ProfileController.inActiveAccount`(`DELETE /my-page`)**: 30일 소프트 삭제 정책을 구현한 실제 백엔드 API가 이미 존재한다. RN 쪽 `AccountDeleteScreen.tsx`의 `performDeleteAccount`가 `logger.debug`만 찍고 이 API를 호출하지 않는다는 것이 이전 MVP 감사에서 발견됐는데, 원인은 백엔드 부재가 아니라 **프론트가 이미 있는 API를 연결하지 않은 것**임이 이번 조사로 확인됐다.

## 6. 프론트엔드 커버리지 격차

`mirror-soul/src/services/`에는 `authService`, `callService`, `fileService`, `onboardingService`, `s3Service` 5개(+`apiClient` 공통 모듈)만 존재한다. 백엔드 12개 컨트롤러 중 아래 6개에 대응하는 전용 FE 서비스 모듈이 없다:

- **Chat** (`ChatController`, 6개 엔드포인트) — 채팅 화면/기능 자체가 아직 FE에 없거나 준비 중으로 추정
- **Meeting** (`MeetingController`, 4개 엔드포인트) — 만남 신청 기능
- **Profile/my-page** (`ProfileController`, 10개 엔드포인트) — 마이페이지, 시간 충전, 오디오/알림 설정, 회원탈퇴 등 (§5의 `inActiveAccount` 미연결이 이 격차의 구체적 사례)
- **PushDevice** (`PushDeviceController`, 2개 엔드포인트) — 푸시 알림 기기 등록
- **Evolve** (`EvolveController`, 3개 엔드포인트) — Twin sync rate, 음성 갱신
- **Admin** (`AdminController`, 1개 엔드포인트) — 관리자용, FE에서 필요 없을 가능성 높음

`MatchController`(`/match/twins`)와 `OnboardingController`는 전용 서비스 파일이 없지만 다른 훅/컴포넌트에서 `apiClient`를 직접 호출하고 있을 가능성이 있다 — 이번 조사는 `services/` 폴더 존재 여부만 확인했으므로, 실제 호출 여부는 별도 확인이 필요하다.

**해석**: "API 응답/요청 구조를 큰 틀에서 파악하고 싶다"는 원 목적에 비추어 보면, 단순히 기존 6개 서비스의 타입을 백엔드와 맞추는 것보다 이 커버리지 격차(특히 Profile/my-page 10개 엔드포인트 — 마이페이지 화면 전체)가 더 큰 이슈일 수 있다. 다음 단계 계획 시 우선순위 판단에 참고할 것.

## 7. 이번 조사의 한계 (다음 단계 후보)

- ~~`possibleErrorCodes`는 Service 계층의 실제 `throw` 호출부를 전수 대조하지 않은 추론값이다~~ → **§0에서 해소됨** (v1.1.0, Service 계층 70개 throw 호출부 전수 검증 완료).
- Spring Security 설정(`SecurityConfig` 등)을 조사하지 않아, "컨트롤러 코드에 인증 어노테이션이 없는" 엔드포인트(§5의 Admin, `markInProgress`)가 실제로 인증이 걸려 있는지는 확인하지 못했다. 이번 Service 계층 검증에서도 `CallService.markInProgress`가 통화 소유자 검증을 전혀 하지 않는다는 점이 재확인됐다 — `endCall`은 `call.getUser().getUuid().equals(userUuid)`로 소유자를 검증하는데 `markInProgress`는 그런 검증이 없다. 이 둘의 비대칭이 의도적인지(예: 상대방 클라이언트가 "연결됨"을 알리는 용도라 소유자 무관) 아니면 누락인지는 백엔드 팀 확인이 필요하다.
- 응답 DTO 필드의 실제 null 가능 여부(예: `CallResDTO.EndCallDTO.durationSec`가 항상 채워지는지)는 Service 구현체를 봐야 확정할 수 있어 `backend-schema.json`에서는 전부 `null`(미상)로 표기했다. 이번 §0 검증 과정에서 일부는 부수적으로 확인됐다 (예: `MeetingResDTO.RequestDTO`의 `twinSimilarity`/`conversationSummary`/`summaryPoints`는 `CallMatchAnalysis`가 아직 `COMPLETED` 상태로 분석되지 않았으면 `null`/빈 리스트로 내려온다는 것을 `MeetingService.toRequestDTO`에서 확인) — 하지만 이는 부산물이지 이번 조사의 정식 목표는 아니었다.
- `ProfileController.inActiveAccount`(회원탈퇴)가 실제로 "30일 뒤 영구 삭제"를 수행하는 배치/스케줄러는 Service 계층(`@Service` 클래스들)에서 발견되지 않았다 — `@Scheduled` 애노테이션이 붙은 별도 컴포넌트가 있는지 (`config/`, `batch/` 등 다른 패키지) 확인이 안 된 상태다. `DeleteWarningSection.tsx`의 "30일 후 영구 삭제" 문구가 실제로 지켜지는지 확인하려면 이 스케줄러의 존재 여부를 다음 단계에서 확인해야 한다.
