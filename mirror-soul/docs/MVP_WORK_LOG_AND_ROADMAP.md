# MVP 작업 로그 및 고도화 로드맵

> 이 문서는 여러 세션에 걸쳐 진행된 DX 리팩토링 + 1차 MVP 출시 준비 작업을 정리한 것이다.
> 목적은 하나: **미래의 Claude Code 세션(또는 사람)이 이 문서만 읽고 바로 이어서 작업할 수 있게 하는 것.**
>
> **먼저 볼 것**: 저장소 루트 `../../CLAUDE.md`(모노레포 공통: git 습관, 백엔드 API 정본 위치, iOS 빌드 트러블슈팅)와 `../CLAUDE.md`(RN 앱 컨벤션: API 서비스 레이어 패턴, 에러코드 유틸리티) — 이 문서는 "무엇을 했고 무엇이 남았는지"에 집중하고, "어떻게 하는지"는 그 두 파일에 정리했다.

---

## 1. 전체 작업 흐름 (시간순)

1. **DX 리팩토링** — `feat/123-dx-logic` (11개 커밋). ⚠️ **원격 브랜치의 실제 상태 미확인** — `origin/feat/123-dx-logic`에 이 절에서 설명하는 산출물(`DX_TYPE_LINT_BACKLOG.md` 등)이 보이지 않는다. 로컬에만 커밋되고 push가 안 됐을 가능성이 있으니, 이 브랜치를 이어서 작업하려면 먼저 로컬/원격 상태를 직접 확인할 것.
2. **1차 MVP 출시 준비도 감사** — RN 코드 기준으로 법적/스토어 심사/비즈니스 크리티컬 문제를 찾고, 문제별로 독립 브랜치 7개 생성 → **전부 `main`에 merge 완료**
3. **동의 UX 후속 개선** — 7개 중 2개 브랜치(`feat/mvp-biometric-consent`, `feat/mvp-age-gate`)에 "동의 항목 클릭 시 실제 내용을 보여주는" 기능 + 마케팅 선택 동의 추가
4. **헤더/바텀바 UI 리팩토링** — `refactor/132-header-bottom-ui` (탭 헤더 텍스트 스타일 통일 + 아이폰 스타일 프로스티드 블러 바텀바) → **`main`에 merge 완료 (PR #133)**
5. **iOS 실기기 빌드 트러블슈팅** — `expo-font` 플러그인 스키마 버그, Sentry 소스맵 자동 업로드 실패, Expo CLI의 기기 설치 버그, SDK 버전 정렬 후 `node_modules` 꼬임까지 총 4개의 순차적 빌드 차단 이슈를 진단/수정 (§4.5 참고)
6. **백엔드 API 스키마 전수 조사 (Phase 1)** — 백엔드 12개 컨트롤러·46개 엔드포인트·47개 에러코드를 Service 계층까지 검증해서 `.claude/artifacts/backend-schema.json`/`analysis-report.md`로 산출 (§4.6 참고)
7. **Profile/my-page 백엔드 연동** — `feat/134-api` (마이페이지 6개 화면을 실제 API로 연결 + 공통 에러코드 유틸리티 신규) → **PR 오픈, 아직 미merge** (§4.7 참고)

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
| `feat/134-api` | main | 🔵 PR 오픈, 미merge | 마이페이지(Profile) 6개 화면 실제 API 연동 + 공통 에러코드 유틸리티 |

위 7개 MVP 브랜치 + `refactor/132-header-bottom-ui`는 이미 전부 `main`에 있으므로, 아래 "머지 시 주의할 충돌 지점"은 **과거 기록용**이다 — 이제 새로 이 브랜치들을 다시 체크아웃해서 머지할 일은 없다.

<details>
<summary>머지 시 주의했던 충돌 지점 (과거 기록)</summary>

- `feat/mvp-biometric-consent`와 `feat/mvp-age-gate`는 둘 다 `Step1AccountContainer.tsx`, `step1.ts`, 그리고 **동일한 신규 파일** `src/constants/consentContent.ts` / `src/components/common/ConsentDetailSheet.tsx`를 각자 만들었다 (브랜치가 독립적이라 부득이하게 중복 생성). 먼저 머지되는 쪽이 파일을 만들고, 나중 쪽은 "같은 파일을 둘 다 만듦" 충돌만 나며, 내용이 동일하니 아무 쪽이나 채택하면 된다.
- `refactor/mvp-call-time-display`는 `AvailableTimeCard.tsx`(2곳)와 `TimeRefillBottomSheet.tsx`를 건드리므로 나머지 브랜치와는 겹치지 않는다.

</details>

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
- `jest-expo`/`@testing-library/react-native`는 **Expo SDK 버전에 정확히 맞는 major**를 설치해야 한다. latest를 깔면 React 19.2+를 요구해서 이 프로젝트(React 19.1.0)와 충돌하고, `renderHook()`이 에러 없이 `result: undefined`만 반환하는 조용한 실패로 나타난다. `mirror-soul/.claude/skills/dx-audit/SKILL.md`에 정확한 버전 조합이 기록되어 있다.
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

### 4.6 백엔드 API 스키마 전수 조사 (Phase 1)

프론트-백엔드 동기화를 위해 백엔드(`mirror-soul-back`) 전체를 정밀 조사해서 저장소 루트 `.claude/artifacts/`에 산출했다:

- `backend-schema.json` — 12개 컨트롤러·46개 엔드포인트 전수(요청/응답 DTO, 검증 규칙), 47개 에러코드 전수. 에러코드 매핑은 처음엔 이름 기반 추론이었으나, 이후 **19개 Service 클래스의 실제 `throw` 호출부 70곳을 전부 대조**해서 검증했다 (`verified: true`). 이 과정에서 정의만 있고 코드베이스 어디서도 안 던져지는 에러코드 9개(`DUPLICATE_LOGINID`, `FILE_EMPTY` 등)를 확인했다.
- `analysis-report.md` — `ApiResponse<T>` 실제 구조, 프론트-백엔드 API 커버리지 격차(§6.1 참고), 아키텍처 특이사항 서술.

**중요**: 이 두 파일은 조사 시점의 스냅샷이다. 백엔드 코드가 그 이후 바뀌었을 수 있으니, 실제로 뭔가 이상하면 백엔드 코드를 다시 확인할 것 — 하지만 처음부터 다시 조사하는 것보다는 이 파일을 기준점 삼아 달라진 부분만 확인하는 게 훨씬 빠르다.

### 4.7 Profile/my-page 백엔드 연동 (`feat/134-api`)

§4.6에서 찾은 FE-BE 커버리지 격차 중 Profile/my-page 도메인을 실제로 연동했다:

- 신규: `src/types/api/profile.ts`, `src/services/profileService.ts`, `src/utils/apiErrorCode.ts`(공통 에러코드 유틸리티 — 향후 Chat/Meeting/Evolve/PushDevice 연동 시에도 재사용).
- 마이페이지 6개 화면(로그아웃, 닉네임 변경, 회원탈퇴, 시간 조회/충전, 오디오 속도, 알림 설정 중 "시간 소진 알림")을 `console.log`/하드코딩 mock에서 실제 API 호출로 교체.
- 패턴은 `../CLAUDE.md`에 정리해뒀다 — 나머지 도메인(Chat/Meeting/PushDevice/Evolve)도 이 패턴을 그대로 따르면 된다.

---

## 5. 향후 세션을 위한 실전 팁

일반적인 git/빌드 습관(브랜치 재확인, `git add` 특정 파일만, `gh` CLI 없음, tsc 베이스라인 diff 확인법 등)은 저장소 루트 `../../CLAUDE.md`와 `../CLAUDE.md`로 옮겼다 — 거기가 최신이니 그쪽을 볼 것. 아래는 이 문서에만 있는, 브랜치 히스토리에 특화된 메모:

- 사용자가 로컬에 별도로 Firebase 연동 실험(`GoogleService-Info.plist`, `plugins/withFmtConstevalFix.js` 등)을 진행할 때가 있다. 미커밋 상태로 작업 디렉토리에 남아있을 수 있으니, `git status`에서 낯선 파일이 보이면 지우지 말고 사용자의 진행 중인 작업일 가능성을 먼저 의심할 것.
- §2의 7개 MVP 브랜치는 이미 전부 `main`에 merge되어 있다 — 과거에 있었던 충돌 지점은 더 이상 재현되지 않는다.

---

## 6. 고도화(Enhancement) 로드맵

### 6.1 지금 바로 RN 단독으로 해볼 만한 것
- [x] ~~회원탈퇴/로그아웃/닉네임변경/시간조회·충전/오디오설정/알림설정(일부)을 실제 API로 연결~~ → `feat/134-api`에서 완료 (§4.7)
- [ ] `src/components/home/main/AvailableTimeCard.tsx`와 `src/features/profile/components/AvailableTimeCard.tsx` — 이름은 같지만 완전히 다른 두 컴포넌트를 하나로 통합 (디자인 결정 필요, 상태/API 연동은 이미 통일됨, UI 병합만 안 함)
- [ ] `src/components/home/main/RefillModal.tsx`와 `src/features/profile/components/TimeRefillBottomSheet.tsx` — 마찬가지로 UI 자체를 하나로 병합 (`TimeRefillBottomSheet.tsx`만 실제 `buyTime` API에 연결됨, `RefillModal.tsx`는 여전히 UI만 있고 API 미연결)
- [ ] `chore/mvp-app-store-config`의 `REPLACE_WITH_EAS_PROJECT_ID` placeholder 2곳 — `eas init` 실행 후 실제 값으로 교체
- [ ] Sentry DSN 실제 발급받아 `.env`에 설정하고 크래시 리포팅 동작 확인 (발급 전까지는 `plugins/withSentryDisableAutoUpload.js`가 소스맵 업로드 실패를 막아주고 있음 — §4.5)
- [ ] 남은 tsc/lint 에러 정리 (`docs/DX_TYPE_LINT_BACKLOG.md`는 §1의 이유로 위치 불확실 — 있으면 참고, 없으면 `npx tsc --noEmit`/`npm run lint`로 새로 그룹핑)
- [ ] `docs/TODO_BACKLOG.md`의 나머지 TODO — 얼굴 스캔 라우트, 이미지 업로드 API 연동, 찜/공유 기능 스코프 확정 등 (마찬가지로 위치 불확실)
- [ ] **Chat/Meeting/PushDevice/Evolve API 연동** — `message-room`(채팅)은 지금도 100% 로컬 mock, 매칭 수락/거절 버튼은 `onPress`조차 없음. 백엔드 API는 이미 있다(`.claude/artifacts/backend-schema.json`의 `ChatController`/`MeetingController`/`PushDeviceController`/`EvolveController`) — `feat/134-api`에서 확립한 서비스 레이어 패턴(`../CLAUDE.md`)을 그대로 적용하면 된다. 백엔드 협업이 필요한 항목이 아니라 **RN 단독으로 바로 착수 가능**한 것으로 재분류함.

### 6.2 백엔드 협업이 필요한 것 (RN 단독으로 못 끝남)
- [ ] **실제 IAP/결제 연동** (Track 2) — `react-native-iap` 또는 RevenueCat, 영수증 검증 API. `POST /my-page/buy-time`은 `feat/134-api`로 실제 연동됐지만 **결제 검증 없이 초 단위 값을 그대로 더해주는 API**다(백엔드 자체가 아직 mock에 가까움, `analysis-report.md` §5 참고) — `useAICallFlow.ts`의 `startCall()`에 사전 잔액 체크가 여전히 없어 무료로 무제한 통화가 가능한 상태임을 재확인할 것
- [ ] 차단/신고의 서버 사이드 강제 — `feat/mvp-block-report`의 로컬 차단목록은 "내 화면에서 안 보이게"만 할 뿐, 상대가 실제로 연락 못 하게 막지는 못함. 백엔드에 차단/신고 API 자체가 없음(`backend-schema.json` 12개 컨트롤러에 없음) — 신규 백엔드 API 설계부터 필요
- [ ] PASS 본인인증 벤더 계약 및 실제 연동 (`fix/mvp-remove-fake-pass-verification`은 가짜 UI만 제거, 실제 연동은 비즈니스 결정 대기)
- [ ] 회원탈퇴의 "30일 후 영구 삭제" 실제 이행 여부 미확인 — `DELETE /my-page`는 상태를 `INACTIVE`로 바꿀 뿐, 30일 뒤 실제로 데이터를 지우는 배치/스케줄러가 백엔드 Service 계층에서는 발견되지 않았다(`analysis-report.md` §7). 별도 스케줄드 잡이 있는지 백엔드 쪽에 확인 필요
- [ ] 멀티기기(여러 휴대폰) 통화/채팅 — `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md`(위치 불확실, §1 참고)에 설계만 있고 구현은 시작 안 함. 백엔드 시그널링 서버를 1:1 relay에서 room 기반 브로드캐스트로 바꿔야 함

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
| `../../CLAUDE.md` | main | 모노레포 공통: 저장소 구조, git 습관, 백엔드 API 정본 위치, iOS 빌드 트러블슈팅 |
| `../CLAUDE.md` | main | RN 앱 컨벤션: API 서비스 레이어 패턴, 에러코드 유틸리티, 상태관리 |
| `.claude/artifacts/backend-schema.json` | main | 백엔드 12개 컨트롤러·46개 엔드포인트·47개 에러코드 전수 (Service 계층까지 검증됨) |
| `.claude/artifacts/analysis-report.md` | main | 백엔드 아키텍처 분석 + FE-BE 커버리지 격차 |
| `docs/MVP_WORK_LOG_AND_ROADMAP.md` (이 문서) | main | 전체 작업 로그 + 고도화 로드맵 |
| `docs/DX_TYPE_LINT_BACKLOG.md` | `feat/123-dx-logic`(위치 불확실, §1) | 남은 tsc/lint 에러 그룹별 정리 |
| `docs/TODO_BACKLOG.md` | `feat/123-dx-logic`(위치 불확실, §1) | 백엔드/제품 결정 필요한 TODO 목록 |
| `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md` | `feat/123-dx-logic`(위치 불확실, §1) | 멀티기기 통화/채팅 설계 제안 |
| `.claude/skills/dx-audit/SKILL.md` | `feat/123-dx-logic`(위치 불확실, §1) | 재사용 가능한 DX 점검 체크리스트 스킬 |
