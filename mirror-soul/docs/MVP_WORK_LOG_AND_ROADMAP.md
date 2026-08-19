# MVP 작업 로그 및 고도화 로드맵

> 이 문서는 여러 세션에 걸쳐 진행된 DX 리팩토링 + 1차 MVP 출시 준비 작업 + Profile/my-page 고도화 작업을 정리한 것이다.
> 목적은 하나: **미래의 Claude Code 세션(또는 사람)이 이 문서만 읽고 바로 이어서 작업할 수 있게 하는 것.**
>
> **먼저 볼 것**: 저장소 루트 `../../CLAUDE.md`(모노레포 공통: git 습관, 백엔드 API 정본 위치, iOS 빌드 트러블슈팅)와 `../CLAUDE.md`(RN 앱 컨벤션: API 서비스 레이어 패턴, react-query 마이그레이션 이후의 최신 상태관리 패턴) — 이 문서는 "무엇을 했고 무엇이 남았는지"에 집중하고, "어떻게 하는지"는 그 두 파일에 정리했다.
>
> **주의**: 이 세 파일(`../../CLAUDE.md`, `../CLAUDE.md`, `.claude/artifacts/*`)은 원래 `docs/claude-code-efficiency-guide` 브랜치에서 작성됐고, `feat/136-mypage-api-advancement`/`feat/137-auth-hardening`에는 없었다 (두 브랜치가 별개로 `main`에서 분기됨). 2026-07-30 세션에서 `git show`로 해당 브랜치의 최신 버전을 `feat/136-mypage-api-advancement` 워킹트리에 복사해서 커밋했다(`0db0ce7`). `feat/137-auth-hardening`은 그 커밋 이후로 분기했으므로 이미 포함하고 있다. 2026-07-30 세션 후반에 `feat/136-mypage-api-advancement`가 먼저 `main`에 merge됐고(§1의 8~9번), 이 문서는 그 뒤 `feat/137-auth-hardening`을 `main`에 merge하며 발생한 충돌을 해결하는 과정에서 두 브랜치의 로그를 합쳤다.

---

## 1. 전체 작업 흐름 (시간순)

1. **DX 리팩토링** — `feat/123-dx-logic` (11개 커밋). ⚠️ **원격 브랜치의 실제 상태 미확인** — 로컬에만 커밋되고 push가 안 됐을 가능성이 있으니, 이 브랜치를 이어서 작업하려면 먼저 로컬/원격 상태를 직접 확인할 것.
2. **1차 MVP 출시 준비도 감사** — RN 코드 기준으로 법적/스토어 심사/비즈니스 크리티컬 문제를 찾고, 문제별로 독립 브랜치 7개 생성 → **전부 `main`에 merge 완료**
3. **동의 UX 후속 개선** — 7개 중 2개 브랜치(`feat/mvp-biometric-consent`, `feat/mvp-age-gate`)에 "동의 항목 클릭 시 실제 내용을 보여주는" 기능 + 마케팅 선택 동의 추가
4. **헤더/바텀바 UI 리팩토링** — `refactor/132-header-bottom-ui` (탭 헤더 텍스트 스타일 통일 + 아이폰 스타일 프로스티드 블러 바텀바) → **`main`에 merge 완료 (PR #133)**
5. **iOS 실기기 빌드 트러블슈팅** — `expo-font` 플러그인 스키마 버그, Sentry 소스맵 자동 업로드 실패, Expo CLI의 기기 설치 버그, SDK 버전 정렬 후 `node_modules` 꼬임까지 총 4개의 순차적 빌드 차단 이슈를 진단/수정 (§4.5 참고)
6. **백엔드 API 스키마 전수 조사 (Phase 1)** — 백엔드 12개 컨트롤러·46개 엔드포인트·47개 에러코드를 Service 계층까지 검증해서 `.claude/artifacts/backend-schema.json`/`analysis-report.md`로 산출 (§4.6 참고)
7. **Profile/my-page 백엔드 연동** — `feat/134-api` (마이페이지 6개 화면을 실제 API로 연결 + 공통 에러코드 유틸리티 신규) → **`main`에 merge 완료 (PR #135)**
8. **Profile/my-page 고도화 (1단계+2단계)** — `feat/136-mypage-api-advancement` (Toast/로딩/dedup-guard UX 하드닝 → 이후 프로젝트에 이미 설치돼 있던 react-query로 전면 마이그레이션) → **`main`에 merge 완료** (§4.8 참고)
9. **CodeRabbit 리뷰 대응 + 로그인 라우트 충돌 버그 수정** — 여전히 `feat/136-mypage-api-advancement` (§4.8에 대한 CodeRabbit 리뷰 6건 반영 + 로그아웃/회원탈퇴 후 로그인 화면으로 안 나가지는 버그의 실제 원인(라우트 충돌) 발견/수정) → **`main`에 merge 완료** (§4.9 참고)
10. **인증(Auth) 고도화 분석 + 프론트 개선** — `feat/137-auth-hardening` (백엔드/프론트 인증 전수 분석 → 프론트에서 바로 할 수 있는 4가지: 사전 토큰 갱신, 로그아웃 캐시 정리, 로그인/회원가입 react-query 마이그레이션, 비밀번호 찾기 UI 스캐폴딩) → **구현+커밋+push 완료. `main`에 merge하는 과정에서 §4.9의 라우팅 수정과 충돌해서(둘 다 같은 로그아웃 버그를 각자 고침), 병합 시 §4.9의 `/login` 수정을 유지하면서 이 브랜치의 `performLogout()` 공유 헬퍼로 통일했다** (§4.10 참고, 지금 이 브랜치). 백엔드 변경(리프레시 토큰 rotation, access token 즉시 무효화, rate limiting, 비밀번호 재설정 엔드포인트)은 이번 세션에서 하지 않고 §6.2에 협의 체크리스트로만 정리했다.

---

## 2. 브랜치 인벤토리

| 브랜치 | 기반 | 상태 | 핵심 내용 |
|---|---|---|---|
| `feat/123-dx-logic` | main | ⚠️ 원격 상태 불확실 (§1 참고) | 툴링/린팅/타입/테스트/CI 정비 + 재사용 스킬 + 멀티기기 통화 설계 문서 |
| `fix/mvp-remove-fake-pass-verification` | main | ✅ merge 완료 | 가짜 PASS 인증 UI 제거 |
| `feat/mvp-biometric-consent` | main | ✅ merge 완료 | 생체정보 별도 동의 + 상세보기 시트 + 마케팅 선택 동의 |
| `feat/mvp-age-gate` | main | ✅ merge 완료 | 만 19세 자가 확인 + 상세보기 시트 |
| `feat/mvp-ai-twin-disclosure` | main | ✅ merge 완료 | 통화 기록에 "AI 트윈" 라벨링 |
| `feat/mvp-block-report` | main | ✅ merge 완료 | 차단/신고 클라이언트 사이드 구현 |
| `chore/mvp-app-store-config` | main | ✅ merge 완료 | 번들ID, privacy manifest, eas.json, Sentry, expo-updates |
| `refactor/mvp-call-time-display` | main | ✅ merge 완료 | 통화시간 표시 상태 통합 |
| `refactor/132-header-bottom-ui` | main | ✅ merge 완료 (PR #133) | 탭 헤더 텍스트 스타일 통일, 프로스티드 블러 바텀바, iOS 빌드 차단 이슈 4건 수정 |
| `feat/134-api` | main | ✅ merge 완료 (PR #135) | 마이페이지(Profile) 6개 화면 실제 API 연동 + 공통 에러코드 유틸리티 |
| `docs/claude-code-efficiency-guide` | main | 🔵 미merge (상태 불확실) | 루트/`mirror-soul/` `CLAUDE.md` 신규 작성 + 백엔드 스키마 아티팩트 커밋 |
| `feat/136-mypage-api-advancement` | main (8ffcbdf, feat/134-api merge 직후) | ✅ `main`에 merge 완료 | Toast/로딩/에러 UX 하드닝 + react-query 전면 마이그레이션(§4.8) + CodeRabbit 대응/로그인 라우트 충돌 수정(§4.9) |
| `feat/137-auth-hardening` | `feat/136-mypage-api-advancement` (0db0ce7) | 🟡 커밋+push 완료, `main` merge 중 충돌 해결(지금 이 브랜치) | 백엔드/프론트 인증 전수 분석 + 사전 토큰 갱신/로그인·회원가입 react-query 마이그레이션/비밀번호 찾기 스캐폴딩 (§4.10). 로그아웃 관련 파일에서 §4.9와 충돌 발생 → `performLogout()` 헬퍼 유지 + `/login` 타겟으로 통일 |

---

## 3. DX 리팩토링 상세 (`feat/123-dx-logic`)

`mirror-soul` 앱에 없던 개발 도구 체인을 정비했다. **범위는 RN 앱(`mirror-soul/`)에 한정**, 백엔드/AI/인프라는 건드리지 않았다.

| 커밋 | 내용 |
|---|---|
| `46e698c` | Prettier + Husky + lint-staged + `typecheck` 스크립트. `svg.d.ts` 추가로 tsc 에러 88→34 감소 |
| `11c2741` | 남은 raw `console.*` → `logger` 유틸로 교체 |
| `770acb3` | 앱 최상위 `ErrorBoundary` 추가 |
| `65de869` | `src/services/*`의 `any` 제거 (webrtc 훅의 `any`는 의도적으로 남김) |
| `e0874d5` | `src/features/*` barrel export 안 쓰는 컨벤션을 `.agents/AGENTS.md`에 문서화 |
| `4535d99` | jest-expo 테스트 베이스라인 + `useWebRTCCall` 테스트 3개 |
| `74aaf56` | `.github/workflows/mirror-soul-ci.yml` (lint/typecheck 비차단, test는 차단) |
| `d2cf934` | TODO 정리, `AccountSettingsScreen`의 가짜 로그아웃을 실제 `useAuthStore().logout()`로 연결 |
| `c0d3427` | 멀티기기 통화/채팅 설계 문서 (`docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md`) — **코드 없음, 설계만** |
| `d5e11f6`, `3abea81` | 재사용 가능한 `dx-audit` Claude Code 스킬 (`mirror-soul/.claude/skills/dx-audit/`) — 다음에 또 DX 점검할 때 `/dx-audit`처럼 실행 가능 |

**이 브랜치에만 존재하는 문서** (아직 main에는 없음):
- `mirror-soul/docs/DX_TYPE_LINT_BACKLOG.md` — 못 고친 tsc 34개/lint 14개 에러 그룹별 정리
- `mirror-soul/docs/TODO_BACKLOG.md` — 백엔드/제품 결정이 필요한 TODO 6건
- `mirror-soul/docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md` — 여러 휴대폰이 통화/채팅으로 연결되는 기능의 아키텍처 제안

**겪었던 삽질 (다음에 반복하지 않도록)**:
- `jest-expo`/`@testing-library/react-native`는 **Expo SDK 버전에 정확히 맞는 major**를 설치해야 한다. latest를 깔면 React 19.2+를 요구해서 이 프로젝트(React 19.1.0)와 충돌한다. 이번 세션(§4.8)에서 다시 겪었다: `jest-expo@54.0.17` + `@testing-library/react-native@13.3.3` + `@types/jest@30.0.0` + **`react-test-renderer@19.1.0`을 devDependency로 명시 고정**해야 `npm install`이 peer-dependency 충돌 없이 성공한다 (안 그러면 `@testing-library/react-native`가 `react-test-renderer@19.2.8`을 끌어와서 `react@^19.2.8`을 요구).
- `mirror-soul`은 모노레포 서브디렉토리라 자체 `.git`이 없다. Husky 훅은 `mirror-soul/.husky/`에 두고, 저장소 루트에서 `git config core.hooksPath mirror-soul/.husky`로 수동 연결해야 한다.

---

## 4. MVP 출시 준비도 감사 요약

3개 서브에이전트로 (1) 온보딩 생체정보 수집 흐름, (2) 결제 흐름, (3) 앱스토어 배포 설정을 조사해서 나온 결론: **"다듬어야 할 앱"이 아니라 "결제·본인인증·삭제권이 통째로 mock이거나 없는 앱"**이었다.

발견한 문제는 심각도별로 나눴다 (전체 목록은 아래 "고도화 로드맵" §6 참고):
- **P0 법적/컴플라이언스**: 생체정보 별도 동의 없음, 가짜 PASS 인증, 회원탈퇴 미구현, 나이 확인 없음, 약관이 플레이스홀더 링크
- **P0 스토어 심사 거절 위험**: 차단/신고 미작동, Apple privacy manifest 없음, 결제 없이 앱스토어에 디지털 콘텐츠 판매 시도 중
- **P0 비즈니스 크리티컬**: 통화 시작 시 잔액 체크가 전혀 없어 무료로 무제한 통화 가능
- **P1 프로덕션 하드닝**: 크래시 리포팅, EAS 빌드 설정, OTA 업데이트 없음

이 중 **RN 코드만으로 이번 세션에 바로 해결 가능한 7개**를 브랜치로 분리해서 처리했고 (§2 참고), 나머지는 Track 2(별도 IAP 브랜치)/Track 3(백엔드 협업)/Track 4(법무 검토)로 분류해서 아래 로드맵에 남겨뒀다.

### 4.5 iOS 실기기 빌드 트러블슈팅 (원인/해결 확정됨 — 상세는 루트 `../../CLAUDE.md`)

`refactor/132-header-bottom-ui` 검증 중 `npx expo run:ios -d`가 순차적으로 4개의 다른 이유로 실패했다. 전부 원인 확정, 수정 완료:

1. `app.json`의 `expo-font` 플러그인 설정이 잘못된 스키마(객체)를 쓰고 있어 `prebuild --clean` 자체가 크래시 → 경로 문자열 배열로 수정.
2. 실제 Sentry 프로젝트가 없는 상태에서 `sentry-cli` 소스맵 자동 업로드가 항상 실패 → `plugins/withSentryDisableAutoUpload.js` 신규 작성, prebuild 시 `SENTRY_DISABLE_AUTO_UPLOAD=true`를 자동 주입.
3. 빌드는 성공하지만 Expo CLI 자체의 기기 설치 버그(`LockdowndClient` TypeError, 업스트림 이슈)로 설치가 실패 → `ios-deploy`로 우회.
4. `npx expo install --fix`로 SDK 버전을 맞춘 뒤 `node_modules`가 꼬여 Metro가 `@expo/metro-config` 모듈을 못 찾음 → `rm -rf node_modules && npm install` + `npx expo start --clear`.
5. **(2026-07-30, 근본 원인 확정 — 구조적으로 해결 불가)** `mirrorsoul` 스킴이 iOS 시뮬레이터 destination을 아예 못 찾는 문제 발생 → 원인 추적 결과 `GoogleMLKit`(얼굴 스캔용) Pod들이 Apple Silicon arm64 시뮬레이터 슬라이스를 제공하지 않는 게 근본 원인으로 확정됨. 상세는 루트 `../../CLAUDE.md` iOS 빌드 트러블슈팅 §6 참고 — **시뮬레이터 빌드 자체가 현재 불가능하며, 실기기(§4.5의 3번 항목, ios-deploy)로만 검증 가능**.

### 4.6 백엔드 API 스키마 전수 조사 (Phase 1)

프론트-백엔드 동기화를 위해 백엔드(`mirror-soul-back`) 전체를 정밀 조사해서 저장소 루트 `.claude/artifacts/`에 산출했다:

- `backend-schema.json` — 12개 컨트롤러·46개 엔드포인트 전수(요청/응답 DTO, 검증 규칙), 47개 에러코드 전수. 에러코드 매핑은 처음엔 이름 기반 추론이었으나, 이후 **19개 Service 클래스의 실제 `throw` 호출부 70곳을 전부 대조**해서 검증했다 (`verified: true`). 이 과정에서 정의만 있고 코드베이스 어디서도 안 던져지는 에러코드 9개(`DUPLICATE_LOGINID`, `FILE_EMPTY` 등)를 확인했다.
- `analysis-report.md` — `ApiResponse<T>` 실제 구조, 프론트-백엔드 API 커버리지 격차(§6.1 참고), 아키텍처 특이사항 서술.

**중요**: 이 두 파일은 조사 시점의 스냅샷이다. 백엔드 코드가 그 이후 바뀌었을 수 있으니, 실제로 뭔가 이상하면 백엔드 코드를 다시 확인할 것 — 하지만 처음부터 다시 조사하는 것보다는 이 파일을 기준점 삼아 달라진 부분만 확인하는 게 훨씬 빠르다.

### 4.7 Profile/my-page 백엔드 연동 (`feat/134-api`, merge 완료)

§4.6에서 찾은 FE-BE 커버리지 격차 중 Profile/my-page 도메인을 실제로 연동했다:

- 신규: `src/types/api/profile.ts`, `src/services/profileService.ts`, `src/utils/apiErrorCode.ts`(공통 에러코드 유틸리티 — 향후 Chat/Meeting/Evolve/PushDevice 연동 시에도 재사용).
- 마이페이지 6개 화면(로그아웃, 닉네임 변경, 회원탈퇴, 시간 조회/충전, 오디오 속도, 알림 설정 중 "시간 소진 알림")을 `console.log`/하드코딩 mock에서 실제 API 호출로 교체.
- 이때는 zustand 스토어(`useAccountStore`, `useCallTimeStore`, `useVoiceAudioStore`, `useNotificationStore`)에 `fetchXxx()` async 액션을 추가하는 패턴을 썼다 — **이 패턴은 §4.8에서 react-query로 전면 교체되어 더 이상 쓰지 않는다.**

### 4.8 Profile/my-page 고도화 — Toast/UX 하드닝 + react-query 전면 마이그레이션 (`feat/136-mypage-api-advancement`, 지금 이 브랜치)

`feat/134-api`가 만든 API 연동을 두 단계로 고도화했다. **1단계**를 다 만든 뒤 사용자가 "왜 이미 설치돼 있고 다른 화면(`useInterviewQuestions.ts`)에 선례가 있는 `@tanstack/react-query`를 안 쓰냐"고 지적해서, **2단계에서 1단계 산출물 상당수를 react-query로 대체**했다. 두 단계 다 구현/검증(lint+tsc+test) 완료, 2026-07-30 세션에서 8개 도메인별 커밋으로 정리해 push 완료 (§4.9에서 이어서 CodeRabbit 리뷰 대응까지 완료, 이후 `main`에 merge).

**1단계 (UX 하드닝, 이후 일부 대체됨)**:
- `src/components/common/Toast/ToastProvider.tsx` 신규 — `Context`+`useToast()` 훅, `app/_layout.tsx`에 마운트. 스토어 등 React 컴포넌트 밖에서도 토스트를 띄울 수 있게 모듈 레벨 브릿지(`showGlobalToast`)도 노출 (React Navigation의 `navigationRef` 패턴과 동일).
- `src/utils/fetchGuard.ts` 신규 — in-flight dedup + staleness 캐시. **→ 2단계에서 삭제됨** (react-query가 기본 제공).
- zustand 스토어들에 `if (response.isSuccess)` 체크 추가 — 알고 보니 `apiClient.ts` 인터셉터가 이미 `isSuccess===false`면 reject하므로 **죽은 코드**였다 (2단계에서 자연히 없어짐).
- `apiClient.ts` 세션 만료(refresh 실패) 시 `showGlobalToast(...)` 안내 추가 — **유지됨**.
- jest-expo 테스트 인프라 신규 (§3의 "겪었던 삽질" 참고) + `apiErrorCode.test.ts`(11 tests)/`profileService.test.ts`(10 tests) — **유지됨, 2단계에서도 그대로 통과**.

**2단계 (react-query 마이그레이션, 최신 상태)**:
- 상세 패턴은 `../CLAUDE.md`의 "API 연동 패턴" 절 참고 — 이 문서에서는 무엇을 했는지만 요약.
- `src/services/queryClient.ts` 신규(싱글턴 `QueryClient`, `app/_layout.tsx`와 `apiClient.ts` 양쪽이 참조 — 순환참조 회피용).
- 신규 쿼리/뮤테이션 훅: `useProfileQuery`, `useAccountInfoQuery`+`useModifyNicknameMutation`, `useTimeStatusQuery`+`useBuyTimeMutation`, `useDeleteAccountMutation` (전부 `src/features/{profile,account}/hooks/`). `useVoiceAudioSettings.ts`/`useNotificationSettings.ts`는 기존 파일을 훅 내부에서 `useQuery`+`useMutation` 쓰도록 전면 재작성(화면 컴포넌트는 안 건드림).
- **삭제**: `src/utils/fetchGuard.ts`, `src/store/useAccountStore.ts`, `src/store/useCallTimeStore.ts` — 전부 react-query 캐시로 완전 대체.
- **zustand는 다음 두 개로 스코프 축소**: `useVoiceAudioStore`(`speechSpeed`만 — `useAICallFlow.ts`가 훅 없이 `getState()`로 동기 접근할 미러 용도, 단 실제로 `useAICallFlow.ts`가 아직 이 값을 안 읽고 있음을 확인함 — 향후 연동 예정 필드), `useNotificationStore`(`eventAlert`만 — 백엔드 대응 개념이 아예 없는 순수 로컬 설정).
- `formatCallTime`을 `useCallTimeStore.ts`에서 `src/utils/formatCallTime.ts`(순수 함수)로 이동 — 스토어 삭제와 무관하게 여러 컴포넌트가 계속 참조.
- 검증: `npx tsc --noEmit`(건드린 파일 기준 새 에러 0), `npm run lint`(건드린 파일 기준 새 에러 0, 기존 pre-existing warning만), `npm test`(21/21 통과, `apiErrorCode.test.ts`+`profileService.test.ts` 모두 그대로).
- **실기기/시뮬레이터 검증은 아직 못 함** — §4.5의 5번 항목(GoogleMLKit이 Apple Silicon 시뮬레이터 슬라이스를 안 갖고 있어 `mirrorsoul` 스킴 자체가 시뮬레이터로 빌드 불가능, 근본 원인 확정됨)과 `../CLAUDE.md`의 웹 미리보기 크래시(react-native-webrtc, 2026-07-30 확인)에 막혀서 UI 동작 확인이 안 된 상태다. **다음 세션/QA에서 할 일**: §4.5의 3번 항목(`ios-deploy` 경유 실기기 설치)으로 마이페이지 플로우(닉네임 변경, 시간 충전, 오디오/알림 토글, 회원탈퇴)를 실제로 눌러보고 확인할 것 — 시뮬레이터/웹으로는 이 앱을 검증할 수 없다는 점을 다음 세션이 반복해서 재발견하지 않도록 유의.
- 2026-07-30 세션에서 8개 도메인별 커밋으로 정리해 push 완료, 이후 `main`에 merge.

### 4.9 CodeRabbit 리뷰 대응 + 로그인 라우트 충돌 버그 수정 (`feat/136-mypage-api-advancement`)

**CodeRabbit이 §4.8 PR에 남긴 리뷰 6건을 검토 후 전부 반영** (커밋 `279940c`):
- Toast에 스크린리더 지원 추가 — `AccessibilityInfo.announceForAccessibility` + `accessibilityLiveRegion`/`accessibilityRole="alert"` 병행. 프로젝트 전체에 `AccessibilityInfo` 사용례가 이게 처음이었음.
- 잔여 시간 표시 3곳(`components/home/main/AvailableTimeCard.tsx`, `features/profile/components/AvailableTimeCard.tsx`, `TimeRefillBottomSheet.tsx`)이 조회 전/실패 시에도 0초를 그대로 보여주던 문제 → 로딩/에러 상태를 구분해서 재시도 가능한 UI로 교체. `useTimeStatusQuery`가 `staleTime: 0`이라 화면 진입마다 매번 재조회되므로 실제로 자주 발생하는 문제였음.
- 계정탈퇴/시간구매: `isPending` 같은 렌더 파생 상태만으로는 리렌더 사이의 좁은 레이스 윈도우에서 중복 요청이 가능 → `useRef` 동기 락을 `isPending`과 **병행**해서 추가 (`AccountDeleteScreen.tsx`, `TimeRefillBottomSheet.tsx`, `app/(main)/index.tsx`).
- 알림/음성 설정: 조회 완료 전 캐시가 없는 상태에서 토글하면, FE에 UI가 없는 숨김 필드(`missedCallNotificationEnabled`, `opponentVoiceVolume`)를 임의 기본값으로 PATCH해서 실제 서버값을 덮어쓸 위험 → `mutationFn`이 캐시 없으면 reject하고, 조회 완료 전엔 토글/세그먼트 자체를 비활성화.
- 검증: 건드린 13개 파일 기준 tsc/lint 신규 에러 0 (stash 대조로 베이스라인 확인).

**로그아웃 후 로그인 화면으로 안 나가지는 버그** — 사용자가 실기기에서 두 차례에 걸쳐 재현:
1. 1차 시도: `useAuthStore.logout()`이 `tokenStorage.clearAll()` 실패 시 예외를 그대로 던져서, 호출부의 `router.replace('/')`가 스킵되던 문제로 진단하고 try/finally로 방어 (feat/137-auth-hardening의 `0fd17b2` 커밋과 동일한 수정을 이 브랜치에도 포팅).
2. 2차 시도(실제 근본 원인): 그래도 안 됨 — **토큰/상태는 정리되는데 화면 전환이 안 됨**. 원인은 `app/index.tsx`(로그인)와 `(main)` 그룹의 홈 탭이 **둘 다 파일명이 `index`라 경로 `/`를 두고 충돌**하고 있었던 것. `(main)` 안에 있는 상태에서 `router.replace('/')`를 호출하면 라우터가 "이미 `/`에 해당하는 화면(홈)에 있다"고 판단해 로그인 화면으로 안 바뀐다 — `.expo/types/router.d.ts`(생성 파일)에 `{ pathname: '/(main)' | '/' }`로 실제로 명시되어 있어서 확인함.
   - **수정**: `app/index.tsx` → `app/login.tsx`로 rename(고유 경로 `/login` 확보), 로그인/홈을 가리키던 7곳(`app/_layout.tsx` 인증 가드, `app/(main)/index.tsx`, `AccountSettingsScreen.tsx`, `AccountDeleteScreen.tsx`, `apiClient.ts` 세션만료 핸들러, `Header.tsx`의 back-fallback, `app/signup/face-scan.tsx`의 가입완료 이동)를 전부 명시적 경로(`/login` 또는 `/(main)`)로 교체 — 더 이상 모호한 `/`에 기대지 않음.
   - `npx expo start`를 짧게 돌려 `.expo/types/router.d.ts`를 재생성해서 `/login`이 독립 경로로, `/`는 `(main)` 홈에만 매칭되는 것으로 바뀐 걸 직접 확인함.
   - 상세 배경은 `mirror-soul/app/CLAUDE.md` 참고.
- **관찰**: 로그아웃 처리 로직(`authService.logout()` → `useAuthStore.logout()` → `router.replace(...)`, try/finally로 항상 이동 보장)이 `app/(main)/index.tsx`/`AccountSettingsScreen.tsx`/`AccountDeleteScreen.tsx` 3곳에 각각 살짝 다른 모양으로 중복 구현되어 있다. `feat/137-auth-hardening`엔 이미 이걸 묶은 `authService.performLogout()` 공유 헬퍼가 있으니, 두 브랜치를 나중에 합칠 때 그쪽 구현으로 통일하는 게 좋다. 상세는 `mirror-soul/src/features/account/CLAUDE.md` 참고. → **2026-07-30 세션 후반에 실제로 `feat/137-auth-hardening`을 `main`에 merge하면서 그대로 실행함 (§4.10 끝부분 참고).**

### 4.10 인증(Auth) 고도화 분석 + 프론트 개선 (`feat/137-auth-hardening`)

`feat/136-mypage-api-advancement` 기준으로 분기해서, 로그인/회원가입/토큰 갱신/로그아웃 전 구간을 백엔드(Spring Boot, submodule)와 프론트 양쪽에서 전수 분석한 뒤, **이번 세션에서는 프론트만** 개선했다 — 사용자가 "백엔드는 제가 수정하지 않는다"고 명시적으로 확인.

**분석에서 확인된 사실 (백엔드, `mirror-soul-back`)**:
- 로그인/회원가입은 이메일+비밀번호뿐, 소셜 로그인 없음(1차 MVP에서 의도적으로 제외됨, 프론트 코드 주석에도 기록됨).
- Refresh token은 유저당 1개만 DB 컬럼에 평문 저장, rotation 없음, 새 기기 로그인 시 이전 기기 자동 로그아웃(멀티 디바이스 미지원).
- 로그아웃은 refresh token만 무효화 — access token(최대 1시간)은 자연 만료까지 계속 유효, 서버 측 블랙리스트 없음.
- `/auth/login`, `/join/send-code`에 rate limiting 없음. `/join/verify-code`에는 개발용 마스터코드(`123456`)가 하드코딩되어 있음.
- CORS가 `allowedOriginPatterns=["*"]` + `allowCredentials(true)` 조합(안티패턴), `JWT_SECRET` 미설정 시 하드코드 fallback 사용, RBAC 없음(`/admin/**`도 인증만 되면 통과).
- **비밀번호 재설정 관련 엔드포인트가 전혀 없음** (`backend-schema.json` 기준 로그인/회원가입/refresh/logout뿐).

**프론트 확인 사항**: 인증 흐름(로그인/회원가입/사일런트 리프레시 큐잉/라우트 가드/로그아웃) 자체는 이미 견고하게 구현되어 있었음 — 스텁이 아니었다. `apiClient.ts`의 401 리액티브 갱신 + `isRefreshing`/`failedQueue` 동시성 처리는 이미 잘 되어 있었고, 이번엔 그 위에 사전 갱신을 얹었다.

**이번 세션에서 구현한 것 (프론트, 5개 커밋)**:
1. `feat(auth): add pre-emptive access token refresh` — `apiClient.ts`에서 `refreshAccessToken()` 추출(순수 리팩터링) + `jwtUtils.ts`의 `getTokenRemainingMs()` + 신규 `src/hooks/useProactiveTokenRefresh.ts`(만료 60초 전 사전 갱신, `AppState` 포그라운드 복귀 시 재계산).
2. `fix(auth): clear react-query cache on manual logout` — `authService.performLogout()` 신규(서버 세션 정리 실패 무시 → 로컬 로그아웃 → `queryClient.clear()`), 수동 로그아웃 3곳(계정 관리/홈 임시 버튼/회원탈퇴)에 적용. `app/(main)/index.tsx`의 중첩 try/finally 버그(내부 catch가 바깥으로 전파 안 되던 문제)도 같이 수정.
3. `refactor(signup): migrate step1 account creation to react-query` — `useCreateAccountMutation` 신규.
4. `feat(auth): add forgot password UI scaffolding` — `app/forgot-password.tsx` + `useForgotPasswordFlow.ts` + `ForgotPasswordScreen.tsx`. 백엔드 엔드포인트가 없어 이메일/인증코드/재설정 3단계 전부 스텁(`setTimeout` 기반 가짜 지연), TODO 주석으로 실제 연동 지점 표시.
5. `refactor(auth): migrate login to react-query, wire up forgot-password entry` — `useLoginMutation` 신규, `useLoginForm.ts`의 `handleForgotPassword`가 Alert 대신 `/forgot-password`로 라우팅.

**검증**: `npx tsc --noEmit`(건드린 파일 기준 새 에러 0 — `expo-router` typed routes가 신규 `forgot-password` 라우트를 인식 못 해 일시적으로 에러가 났었는데, `npx expo start`를 짧게 한 번 돌려 `.expo/types/router.d.ts`를 재생성해서 해결함, gitignore된 파일이라 커밋 대상 아님), `npx jest`(기존 21/21 통과, 이번 작업에 대한 신규 유닛 테스트는 추가 안 함). **실기기 UI 검증은 다음 QA에서** — §4.5/`../CLAUDE.md`의 이유로 시뮬레이터/웹 둘 다 불가능.

**백엔드 협의가 필요한 항목**은 §6.2로 옮겼다.

**`main` merge 시 실제로 벌어진 충돌** (2026-07-30 세션 후반): 이 브랜치가 `main`을 merge하면서 §4.9와 충돌했다 — 둘 다 "로그아웃 후 로그인 화면으로 안 나가짐" 버그를 각자 고쳤기 때문 (§4.9가 나중에 찾은 진짜 근본 원인이라 `/login` 타겟은 그쪽이 맞고, 이 브랜치의 `authService.performLogout()` 공유 헬퍼는 아키텍처가 더 낫다). 해결 방향: `performLogout()` 헬퍼 구조를 유지하되 모든 `router.replace('/')`를 `router.replace('/login')`으로 교체(`app/(main)/index.tsx`, `AccountSettingsScreen.tsx`, `AccountDeleteScreen.tsx`, `apiClient.ts`의 `refreshAccessToken()`). `git merge-tree --write-tree`로 사전에 충돌 지점을 확인한 뒤 `git merge origin/main`으로 실제 병합, 6개 파일(코드 5 + 이 문서) 충돌을 전부 수동 해결.

---

## 5. 향후 세션을 위한 실전 팁

일반적인 git/빌드 습관(브랜치 재확인, `git add` 특정 파일만, `gh` CLI 없음, tsc 베이스라인 diff 확인법 등)은 저장소 루트 `../../CLAUDE.md`와 `../CLAUDE.md`로 옮겼다 — 거기가 최신이니 그쪽을 볼 것. 아래는 이 문서에만 있는, 브랜치 히스토리에 특화된 메모:

- 사용자가 로컬에 별도로 Firebase 연동 실험(`GoogleService-Info.plist`, `plugins/withFmtConstevalFix.js` 등)을 진행할 때가 있다. 미커밋 상태로 작업 디렉토리에 남아있을 수 있으니, `git status`에서 낯선 파일이 보이면 지우지 말고 사용자의 진행 중인 작업일 가능성을 먼저 의심할 것.
- §2의 7개 MVP 브랜치 + header-bottom-ui + feat/134-api는 이미 전부 `main`에 merge되어 있다 — 과거에 있었던 충돌 지점은 더 이상 재현되지 않는다.
- **"고도화"를 요청받으면**: 표면적인 UX 폴리시(토스트, 스피너)만 추가하지 말고, 먼저 그 문제에 대해 프로젝트에 이미 설치돼 있지만 충분히 안 쓰인 라이브러리/컨벤션이 있는지 확인할 것 (`package.json`, 기존 코드의 일회성 선례 grep). §4.8이 정확히 이 교훈에서 나온 재작업이었다.
- **아키텍처/라이브러리 경계 관련 질문은 실무적 근거를 먼저 제시할 것.** 사용자는 `AskUserQuestion`으로 옵션만 던지는 것보다, "실무적으로는 어떻게 하나요?" 같은 질문에 구체적 이유(업계 표준, 이 코드베이스에서의 실제 트레이드오프)를 먼저 설명해주는 걸 선호한다.

---

## 6. 고도화(Enhancement) 로드맵

### 6.1 지금 바로 RN 단독으로 해볼 만한 것
- [x] ~~회원탈퇴/로그아웃/닉네임변경/시간조회·충전/오디오설정/알림설정(일부)을 실제 API로 연결~~ → `feat/134-api`에서 완료 (§4.7)
- [x] ~~Toast/로딩 스피너/dedup-guard UX 하드닝, react-query로 서버 상태 관리 전면 전환~~ → `feat/136-mypage-api-advancement`에서 완료, push 완료 (§4.8)
- [x] ~~CodeRabbit 리뷰 대응(a11y/로딩·에러 UX/중복요청 가드/숨김필드 보호) + 로그인 라우트 충돌 버그 수정~~ → `feat/136-mypage-api-advancement`에서 완료 (§4.9)
- [x] ~~로그인/회원가입 react-query 마이그레이션, 로그아웃 캐시 정리(`performLogout()` 공유 헬퍼), 사전 토큰 갱신, 비밀번호 찾기 UI 스캐폴딩~~ → `feat/137-auth-hardening`에서 완료 (§4.10)
- [x] ~~로그아웃 로직 중복 제거~~ → `feat/137-auth-hardening`을 `main`에 merge하면서 `authService.performLogout()` 공유 헬퍼로 통일 완료 (§4.10 끝부분 참고)
- [ ] `src/components/home/main/AvailableTimeCard.tsx`와 `src/features/profile/components/AvailableTimeCard.tsx` — 이름은 같지만 완전히 다른 두 컴포넌트를 하나로 통합 (디자인 결정 필요, 상태/API 연동은 이미 통일됨, UI 병합만 안 함)
- [ ] `src/components/home/main/RefillModal.tsx`와 `src/features/profile/components/TimeRefillBottomSheet.tsx` — 마찬가지로 UI 자체를 하나로 병합 (`TimeRefillBottomSheet.tsx`만 실제 `buyTime` API에 연결됨, `RefillModal.tsx`는 여전히 UI만 있고 API 미연결)
- [ ] `chore/mvp-app-store-config`의 `REPLACE_WITH_EAS_PROJECT_ID` placeholder 2곳 — `eas init` 실행 후 실제 값으로 교체
- [ ] Sentry DSN 실제 발급받아 `.env`에 설정하고 크래시 리포팅 동작 확인 (발급 전까지는 `plugins/withSentryDisableAutoUpload.js`가 소스맵 업로드 실패를 막아주고 있음 — §4.5)
- [ ] 남은 tsc/lint 에러 정리 (`docs/DX_TYPE_LINT_BACKLOG.md`는 §1의 이유로 위치 불확실 — 있으면 참고, 없으면 `npx tsc --noEmit`/`npm run lint`로 새로 그룹핑)
- [ ] `docs/TODO_BACKLOG.md`의 나머지 TODO — 얼굴 스캔 라우트, 이미지 업로드 API 연동, 찜/공유 기능 스코프 확정 등 (마찬가지로 위치 불확실)
- [ ] **Chat/Meeting/PushDevice API 연동** — `message-room`(채팅)은 지금도 100% 로컬 mock, 매칭 수락/거절 버튼은 `onPress`조차 없음. 백엔드 API는 이미 있다(`.claude/artifacts/backend-schema.json`의 `ChatController`/`MeetingController`/`PushDeviceController`) — `feat/134-api`+`feat/136-mypage-api-advancement`에서 확립한 react-query 기반 서비스 레이어 패턴(`../CLAUDE.md`)을 그대로 적용하면 된다. (Evolve는 `refactor/156-call-logic`/`feat/153-value-game-api`까지 완료됨, 아래 §6.2 참고)
- [ ] **AI 트윈 영상통화 — 로컬 카메라 토글이 자리표시자** (`refactor/156-call-logic`) — `CallControls`의 카메라 켬/꺼짐 버튼과 `CallLocalPreview`(내 셀프뷰 PIP)는 UI만 있고 실제 로컬 카메라 캡처(`useWebRTCCall.ts`의 `getUserMedia`가 아직 `video: false`)와 연동돼 있지 않다. AI 서버가 실제 영상 트랙을 보내기 시작하는 시점(§6.2 참고)에 맞춰, 내 카메라도 같이 잡아서 상대에게 보낼지 여부를 먼저 정하고 진행할 것.
- [ ] **통화 화면 라이트 모드 실기기 확인** (`refactor/156-call-logic`) — `CallScreenBackground`/`CallHeader`/`CallControls` 등에 `useThemeColors()`를 연동해 라이트 모드 대응 코드는 반영했으나, 실기기에서 눈으로 확인은 안 함. `colors.glow.*` 토큰이 원래 카드 섹션용으로 설계된 낮은 opacity(0.02~0.05)라 통화 화면 같은 풀블리드 히어로 연출에선 너무 옅게 보일 수 있음 — 확인 후 필요하면 라이트 모드 전용 강도 보정 검토.

### 6.2 백엔드 협업이 필요한 것 (RN 단독으로 못 끝남)
- [ ] **학습 데이터(음성/얼굴 등) 보안 갭 — 인프라+AI 서버 협업 필요** (2026-08-18 조사,
  `fix/164-evolve-ui`, Growth 탭 "안전과 개인정보" 문구 검증 중 발견) — RDS 두 개(MySQL/PostgreSQL)
  전부 보안그룹이 DB 포트를 전 인터넷(`0.0.0.0/0`)에 열어두고 있고(코드 주석에 "임시 개발용"이라고
  직접 적혀 있음), RDS MySQL은 저장 시 암호화도 미설정(S3는 명시적 SSE 정책은 없지만 AWS
  기본 SSE-S3가 적용됐을 가능성이 있어 RDS와 같은 "미암호화" 취급은 부정확 — 문서에서 구분함).
  AI 서버(`mirror-soul-AI`)는 조사한 `chat.py`/`training.py`/`/assets`에서 인증·인가를 확인하지
  못했고, 인프라 확인 결과 이 서버가 EC2 퍼블릭 서브넷+고정 퍼블릭 IP+보안그룹 전체개방으로
  중간 계층 없이 직접 노출돼 있어 URL만 알면 실제로 외부 접근이 가능. 자세한 근거와
  우선순위별 권장 조치는 `docs/TRAINING_DATA_SECURITY_FINDINGS.md` 참고 — §4/§6.3의 기존
  법적/컴플라이언스 P0 항목들과 같은 급으로 취급할 것을 권장.
- [ ] **발견(홈) 화면 상대 프로필 상세 — 기존 추천 상세 API에 필드 추가 필요** (2026-08-14 조사, 2026-08-17 정정 — 최초 기록은 "상세 API가 없다"는 잘못된 전제였음, CodeRabbit 리뷰 검증 과정에서 발견) — 지금 `DiscoveryMatchCard.tsx`/`PartnerProfileModal.tsx`가 보여주는 정보(트윈 싱크로율, AI 페르소나 태그, MBTI 축 밸런스, AI 트윈 한줄소개, 가치관 성향)는 전부 `SoulMatch` 목업 데이터다. 백엔드 소스를 직접 확인해보니 **`HomeController`에 발견 탭용 추천 목록/상세/스와이프 API가 이미 구현돼 있다**(`GET /home/recommend`, `GET /home/recommendations/{target-user-uuid}`, `POST /home/recommendations/{target-user-uuid}/swipe` — `MatchController`의 `/match/twins`는 별개로, "이미 통화했던 트윈" 목록이라 발견 탭과 무관함). 상세 응답 `HomeResDTO.RecommendationDetailDTO`엔 `syncRate`/`selfIntroduction`/`twinStatus`/`voicePreview`(실제 재생 가능한 presigned 오디오 URL, 이미 구현됨)까지 있지만, 아래는 여전히 없다:
  - `ClonePersonalityTag`(clone_id, content, display_order) — "AI 페르소나 분석" 태그에 대응, DTO에 없음
  - `MbtiProfile`(mbti, ieScore/nsScore/ftScore/pjScore) — "성향 밸런스" 4축 바에 대응, DTO에 없음
  - `UserValueAxisScore`(user_id, axis, score -1~1, sample_count) — 성장 탭 가치관 밸런스 게임(`ValueBalanceAnswer`) 답변을 축(`LOVE`/`LIFESTYLE`/`COMM`/`DECISION`/`SOCIAL`/`PRIORITY`/`TONE`/`TASTE`)별로 집계한 값. "가치관 성향" 섹션이 원래 있어야 할 자리 — 지금 모달의 "관심사"였던 걸 이걸로 교체한 이유이기도 함(가짜 취미 목록은 백엔드에 대응 필드 자체가 없었음). DTO에 없음
  - **접근 제어 갭**: `RecommendationDetailService.getDetail()`은 대상이 ACTIVE+매칭허용인지만 확인하고, 요청자-대상자 간 추천 노출 관계는 검증하지 않는다 — UUID만 알면 임의 사용자 상세/음성 URL 조회 가능. 차단(block) 기능도 백엔드에 없음(기존에 이미 기록된 갭)
  - 이 항목은 아래 "Chat/Meeting/PushDevice API 연동"과도 연결됨(발견 화면 카드/모달의 "통화하기" 버튼이 현재 `Alert.alert`로 끝나는 이유가 Meeting API 미연동이기 때문 — DTO 필드를 추가하는 김에 같이 설계하는 게 효율적)
  - **백엔드/AI 엔지니어에게 전달할 요청 스펙은 `docs/DISCOVERY_DETAIL_API_REQUEST.md`에 정리해둠** — 실제 존재하는 API/DTO, 추가 요청할 필드, 접근 제어 갭, 가치관 축 점수를 자연어로 가공하는 AI 서버 작업 제안, 프라이버시/보존정책 주의사항 포함
- [ ] **실제 IAP/결제 연동** (Track 2) — `react-native-iap` 또는 RevenueCat, 영수증 검증 API. `POST /my-page/buy-time`은 `feat/134-api`로 실제 연동됐지만 **결제 검증 없이 초 단위 값을 그대로 더해주는 API**다(백엔드 자체가 아직 mock에 가까움, `analysis-report.md` §5 참고) — `useAICallFlow.ts`의 `startCall()`에 사전 잔액 체크가 여전히 없어 무료로 무제한 통화가 가능한 상태임을 재확인할 것
- [ ] 차단/신고의 서버 사이드 강제 — `feat/mvp-block-report`의 로컬 차단목록은 "내 화면에서 안 보이게"만 할 뿐, 상대가 실제로 연락 못 하게 막지는 못함. 백엔드에 차단/신고 API 자체가 없음(`backend-schema.json` 12개 컨트롤러에 없음) — 신규 백엔드 API 설계부터 필요
- [ ] PASS 본인인증 벤더 계약 및 실제 연동 (`fix/mvp-remove-fake-pass-verification`은 가짜 UI만 제거, 실제 연동은 비즈니스 결정 대기)
- [ ] 회원탈퇴의 "30일 후 영구 삭제" 실제 이행 여부 미확인 — `DELETE /my-page`는 상태를 `INACTIVE`로 바꿀 뿐, 30일 뒤 실제로 데이터를 지우는 배치/스케줄러가 백엔드 Service 계층에서는 발견되지 않았다(`analysis-report.md` §7). 별도 스케줄드 잡이 있는지 백엔드 쪽에 확인 필요
- [ ] 멀티기기(여러 휴대폰) 통화/채팅 — `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md`(위치 불확실, §1 참고)에 설계만 있고 구현은 시작 안 함. 백엔드 시그널링 서버를 1:1 relay에서 room 기반 브로드캐스트로 바꿔야 함
- [ ] **AI 트윈 영상통화(WebRTC) 성능/인프라 협업 항목** (2026-08-14, `refactor/156-call-logic`에서 조사 완료, 요청은 전달했으나 반영 여부 미확인):
  - **연결 지연**: `mirror-soul-AI`의 `model_calling/signaling/handlers.py`(`CALL_INVITE` 처리, 라인 64-93)가 매번 커넥션 풀링 없이 새 PyMySQL 커넥션으로 클론 정보를 조회하는 것으로 보임 — AI 서버 엔지니어에게 커넥션 풀 적용 요청함.
  - **세션 레지스트리가 인메모리 싱글턴**: 백엔드 `WebSocketSessionRegistry.java`, AI 서버 `webrtc/session.py` 둘 다 인메모리라, 멀티 인스턴스 배포 시(로드밸런서 sticky session 미설정이면) 시그널링이 에러 없이 조용히 드롭되고 `useAICallFlow.ts`의 10초 `CALL_INVITE` 타임아웃으로 이어질 수 있음 — 인프라 쪽 인스턴스 수/sticky session 설정 확인 필요(RN/백엔드 코드 조사만으론 확인 불가).
  - **통화 중 대화 턴 지연**: `mirror-soul-AI`의 `model_calling/realtime/pipeline.py`(라인 59-175)가 매 발화마다 STT→RAG 메모리 검색→LLM→TTS를 전부 순차 `await` 체인으로 처리 — 병렬화/스트리밍(문장 단위로 TTS 먼저 시작 등) 여지가 있음을 AI 서버 엔지니어에게 전달함.
  - **TURN 서버 부재**: `useWebRTCCall.ts`가 STUN(`stun:stun.l.google.com:19302`)만 쓰고 TURN이 없어 NAT/방화벽이 엄격한 네트워크에서 연결 자체가 실패할 수 있음 — 인프라에 TURN 서버(coturn 등) 구축 요청함. 구축되면 RN 쪽 `ICE_SERVERS` 배열에 자격증명만 추가하면 됨.
  - **통화 텍스트 기록(transcript) 저장 미구현**: `useAICallFlow.ts`의 `_performHangUp`에 TODO로 남아있음. 방법 A(백엔드가 callId별로 저장 → `GET /calls/{callId}/transcript`) vs 방법 B(클라이언트가 통화 중 실시간 STT로 수집해 `endCall` 시 전송) 중 백엔드와 협의 필요.
- [ ] **가치관 밸런스 게임 — `GET /evolve/value-balance` 응답에 진행 카운트 포함 요청** (`feat/153-value-game-api`) — 현재 오늘 답변 개수(`answeredCount`/`dailyLimit`)는 `POST .../answer` 응답에만 있어서, 첫 질문을 볼 때는 진행률(`ValueBalanceModal`의 "Question N of M")을 표시할 수 없음. `ValueBalanceService.getQuestion()`이 이미 quota 체크용으로 오늘 답변 수를 세고 있으니, 그 값을 `valueBalanceQuestionDTO`에 같이 실어달라고 요청함(반영 여부 미확인).
- [ ] **인증(Auth) 백엔드 협의 항목** (§4.9에서 분석만 하고 구현은 안 함, 전부 `mirror-soul-back` 쪽 변경 필요):
  - **로그아웃 시 access token 즉시 무효화**: 현재 `/auth/logout`은 refresh token만 지우고 access token(최대 1시간)은 자연 만료까지 유효함. Redis 블랙리스트(즉시 무효화, 매 요청 조회 필요) vs. TTL 단축(인프라 추가 없음) 트레이드오프 논의 필요 — 프론트에 사전 갱신(§4.9)이 이미 들어갔으므로 TTL을 5~10분으로 줄여도 UX 저하가 크지 않음. 실제 access token TTL 값도 확인 필요(사전 갱신 마진 튜닝에 필요).
  - **로그인/이메일 인증코드 rate limiting**: `/auth/login`, `/join/send-code`에 시도 횟수 제한 없음. `/join/verify-code`의 개발용 마스터코드(`123456`) 하드코딩이 프로덕션에서 비활성화되는지도 확인 필요.
  - **비밀번호 재설정 엔드포인트 신규 필요** (현재 전무) — `/join/*` 3단계 패턴 차용, 제안 스펙:
    - `POST /auth/password/send-code { email }` → 계정 존재 여부와 무관하게 항상 동일한 성공 응답(이메일 존재 노출 방지), `HttpSession`이 아닌 별도 스코프(단기 토큰/Redis, email 키) 필요.
    - `POST /auth/password/verify-code { email, code }` → `{ resetToken }`(5~10분 단기 토큰, `/join/verify-code`처럼 시도횟수 캡).
    - `POST /auth/password/reset { resetToken, newPassword }` → 성공 시 해당 계정의 기존 refresh token 전체 무효화(전 기기 강제 로그아웃) 여부 논의.
    - 프론트 스캐폴딩(`src/features/auth/hooks/useForgotPasswordFlow.ts`)은 이미 준비되어 있어 엔드포인트가 나오면 스텁만 교체하면 됨.
  - **리프레시 토큰 정책**: 사용자가 이번엔 "현재 방식 유지"로 확정함(단일 세션, rotation 없음) — 당장 변경 불필요, 멀티 디바이스 지원이 나중에 요구되면 재논의.
  - **회원가입 이메일 중복 체크가 너무 늦게 일어남 (요청됨, 백엔드 수정 대기 중)**: 2026-07-30 세션에서 소스 직접 확인함 — 중복 이메일 체크(`userRepository.existsByEmail`)가 `POST /join/send-code`나 `/join/verify-code`가 아니라 **`JoinService.basicProfile()`(`mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/service/JoinService.java:54-58`)에서만** 일어난다. `EmailAuthService`(`.../service/EmailAuthService.java`)의 `sendCode`/`verifyCode`는 `UserRepository` 의존성 자체가 없어서, 이미 가입된 이메일이라도 인증코드 발송/확인까지는 전부 성공하고, Step1의 비밀번호·PASS·나이·약관까지 다 입력한 뒤 "다음"을 눌러야만 `DUPLICATE_EMAIL`(HTTP 409, `USER_4090`)을 받는다.
    - **요청할 수정**: `EmailAuthService`에 `UserRepository`를 주입하고, `sendCode()`(`EmailAuthService.java:24-40`, `mailService.sendVerificationCode(...)` 호출 이전)에서 `userRepository.existsByEmail(dto.getEmail())`이면 기존 `GeneralErrorCode.DUPLICATE_EMAIL`(`common/apiPayload/code/GeneralErrorCode.java:48`)을 던지도록. `verifyCode()`에도 동일 체크를 넣을지, 아니면 `send-code` 시점 체크로 충분한지는 백엔드팀 판단에 맡김.
    - **백엔드 수정 완료되면 바로 이어서 할 프론트 작업** (별도 조사 없이 아래로 바로 진행 가능): `src/components/signup/steps/Step1_Account/hooks/useStep1Form.ts`의 `handleSendEmailCode`(현재 catch 블록이 실패 사유 구분 없이 통째로 롤백+`Alert.alert('인증 코드 발송 실패', ...)`) 안에서 `src/utils/apiErrorCode.ts`의 `isConflictError(error)`를 분기해 "이미 가입된 이메일입니다" 인라인 에러(`EmailSection`에 이미 있는 에러 표시 슬롯 재사용)로 바꾸고, 이메일 입력 필드에 포커스를 되돌려 바로 재입력할 수 있게 한다. `Step1AccountContainer.tsx`의 최종 제출 실패 처리(`handleContinue`의 catch)도 동일하게 `isConflictError`면 이메일 필드로 되돌리는 처리를 추가해 최후 방어선으로 남겨둘 것.

### 6.3 법무/콘텐츠 (코드 아님)
- [ ] `feat/mvp-biometric-consent`, `feat/mvp-age-gate`에서 작성한 동의 문구(`src/constants/consentContent.ts`)는 엔지니어가 초안으로 작성한 것 — **정식 출시 전 반드시 법무 검토**를 거쳐 실제 문구로 교체
- [ ] `src/features/terms-policy/constants/termsLinks.ts`의 Notion 플레이스홀더 링크를 실제 호스팅된 문서로 교체
- [ ] 미성년자 보호 정책의 법적 충분성 검토 — 지금은 자가 선언 체크박스뿐, 실제 PASS 연동 전까지 이 정도로 충분한지는 비즈니스/법무 판단 필요

### 6.4 P1 프로덕션 하드닝 (스토어 제출 전 마무리하면 좋음)
- [ ] Push 알림 실제 구현 (`expo-notifications` 미설치, `PUSH_NOTIFICATION_ARCHITECTURE.md`는 설계 문서만 존재)
- [ ] `eas.json`의 build/submit 프로필을 실제 Apple/Google 개발자 계정 정보로 채우기
- [ ] `app.json`의 `bundleIdentifier`/`package`를 `com.mirrorsoul.app`(placeholder)에서 실제 최종 확정값으로 교체 — **스토어 제출 후엔 사실상 변경 불가**하므로 최우선으로 확정 필요

---

## 7. 참고 문서 링크 모음

| 문서 | 위치 | 내용 |
|---|---|---|
| `../../CLAUDE.md` | `docs/claude-code-efficiency-guide` (이 브랜치 워킹트리에도 복사됨, §1 주의사항 참고) | 모노레포 공통: 저장소 구조, git 습관, 백엔드 API 정본 위치, iOS 빌드 트러블슈팅 |
| `../CLAUDE.md` | `docs/claude-code-efficiency-guide` (이 브랜치 워킹트리에도 복사됨, §1 주의사항 참고) | RN 앱 컨벤션: react-query 기반 API 연동 패턴, 상태관리, 에러코드 유틸리티 |
| `.claude/artifacts/backend-schema.json` | `docs/claude-code-efficiency-guide` (이 브랜치 워킹트리에도 복사됨) | 백엔드 12개 컨트롤러·46개 엔드포인트·47개 에러코드 전수 (Service 계층까지 검증됨) |
| `.claude/artifacts/analysis-report.md` | `docs/claude-code-efficiency-guide` (이 브랜치 워킹트리에도 복사됨) | 백엔드 아키텍처 분석 + FE-BE 커버리지 격차 |
| `docs/MVP_WORK_LOG_AND_ROADMAP.md` (이 문서) | `feat/136-mypage-api-advancement` | 전체 작업 로그 + 고도화 로드맵 |
| `mirror-soul/app/CLAUDE.md` | `feat/136-mypage-api-advancement` | 라우팅/네비게이션 도메인: `/` 경로 충돌 위험, Stack/Tabs 구조, 명시적 경로 규칙 |
| `mirror-soul/src/features/account/CLAUDE.md` | `feat/136-mypage-api-advancement` | 인증/로그아웃 도메인: `useAuthStore.logout()` 계약, 로그아웃 진입점 3곳과 중복 현황 |
| `docs/DISCOVERY_DETAIL_API_REQUEST.md` | `fix/158-home-ui` | 발견 화면 상세 모달용 신규 API를 백엔드/AI 엔지니어에게 요청하는 스펙 정리 |
| `docs/TRAINING_DATA_SECURITY_FINDINGS.md` | `fix/164-evolve-ui` | 음성/얼굴 등 학습 데이터의 저장/전송 암호화·네트워크 접근 제어·AI 서버 인증·보존정책 실태 조사(백엔드+AI+인프라 전수) + 우선순위별 권장 조치 |
| `docs/DX_TYPE_LINT_BACKLOG.md` | `feat/123-dx-logic`(위치 불확실, §1) | 남은 tsc/lint 에러 그룹별 정리 |
| `docs/TODO_BACKLOG.md` | `feat/123-dx-logic`(위치 불확실, §1) | 백엔드/제품 결정 필요한 TODO 목록 |
| `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md` | `feat/123-dx-logic`(위치 불확실, §1) | 멀티기기 통화/채팅 설계 제안 |
| `.claude/skills/dx-audit/SKILL.md` | `feat/123-dx-logic`(위치 불확실, §1) | 재사용 가능한 DX 점검 체크리스트 스킬 |
