# MVP 작업 로그 및 고도화 로드맵

> 이 문서는 여러 세션에 걸쳐 진행된 DX 리팩토링 + 1차 MVP 출시 준비 작업을 정리한 것이다.
> 목적은 하나: **미래의 Claude Code 세션(또는 사람)이 이 문서만 읽고 바로 이어서 작업할 수 있게 하는 것.**
> 브랜치는 전부 `main`에서 개별 분기했고, 이 문서 작성 시점 기준 모두 origin에 push만 되어 있고 아직 merge되지 않았다.

---

## 1. 전체 작업 흐름 (시간순)

1. **DX 리팩토링** — `feat/123-dx-logic` (11개 커밋, mirror-soul 앱 한정)
2. **1차 MVP 출시 준비도 감사** — RN 코드 기준으로 법적/스토어 심사/비즈니스 크리티컬 문제를 찾고, 문제별로 독립 브랜치 7개 생성
3. **동의 UX 후속 개선** — 7개 중 2개 브랜치(`feat/mvp-biometric-consent`, `feat/mvp-age-gate`)에 "동의 항목 클릭 시 실제 내용을 보여주는" 기능 + 마케팅 선택 동의 추가

---

## 2. 브랜치 인벤토리

| 브랜치 | 기반 | 커밋 수 | 상태 | 핵심 내용 |
|---|---|---|---|---|
| `feat/123-dx-logic` | main | 11 | push됨, PR 없음 | 툴링/린팅/타입/테스트/CI 정비 + 재사용 스킬 + 멀티기기 통화 설계 문서 |
| `fix/mvp-remove-fake-pass-verification` | main | 1 | push됨 | 가짜 PASS 인증 UI 제거 |
| `feat/mvp-biometric-consent` | main | 2 | push됨 | 생체정보 별도 동의 + 상세보기 시트 + 마케팅 선택 동의 |
| `feat/mvp-age-gate` | main | 2 | push됨 | 만 19세 자가 확인 + 상세보기 시트 |
| `feat/mvp-ai-twin-disclosure` | main | 1 | push됨 | 통화 기록에 "AI 트윈" 라벨링 |
| `feat/mvp-block-report` | main | 1 | push됨 | 차단/신고 클라이언트 사이드 구현 |
| `chore/mvp-app-store-config` | main | 1 | push됨 | 번들ID, privacy manifest, eas.json, Sentry, expo-updates |
| `refactor/mvp-call-time-display` | main | 1 | push됨 | 통화시간 표시 상태 통합 |

**머지 시 주의할 충돌 지점**:
- `feat/mvp-biometric-consent`와 `feat/mvp-age-gate`는 둘 다 `Step1AccountContainer.tsx`, `step1.ts`, 그리고 **동일한 신규 파일** `src/constants/consentContent.ts` / `src/components/common/ConsentDetailSheet.tsx`를 각자 만들었다 (브랜치가 독립적이라 부득이하게 중복 생성). 먼저 머지되는 쪽이 파일을 만들고, 나중 쪽은 "같은 파일을 둘 다 만듦" 충돌만 나며, 내용이 동일하니 아무 쪽이나 채택하면 된다.
- `refactor/mvp-call-time-display`는 `AvailableTimeCard.tsx`(2곳)와 `TimeRefillBottomSheet.tsx`를 건드리므로 나머지 브랜치와는 겹치지 않는다.
- 나머지는 서로 다른 파일을 건드려서 충돌 가능성이 낮다.

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

발견한 문제는 심각도별로 나눴다 (전체 목록은 아래 "고도화 로드맵" §7 참고):
- **P0 법적/컴플라이언스**: 생체정보 별도 동의 없음, 가짜 PASS 인증, 회원탈퇴 미구현, 나이 확인 없음, 약관이 플레이스홀더 링크
- **P0 스토어 심사 거절 위험**: 차단/신고 미작동, Apple privacy manifest 없음, 결제 없이 앱스토어에 디지털 콘텐츠 판매 시도 중
- **P0 비즈니스 크리티컬**: 통화 시작 시 잔액 체크가 전혀 없어 무료로 무제한 통화 가능
- **P1 프로덕션 하드닝**: 크래시 리포팅, EAS 빌드 설정, OTA 업데이트 없음

이 중 **RN 코드만으로 이번 세션에 바로 해결 가능한 7개**를 브랜치로 분리해서 처리했고 (§2 참고), 나머지는 Track 2(별도 IAP 브랜치)/Track 3(백엔드 협업)/Track 4(법무 검토)로 분류해서 아래 로드맵에 남겨뒀다.

---

## 5. 향후 세션을 위한 실전 팁

- **브랜치 전환 시 항상 `git branch --show-current`로 재확인할 것.** 이 세션에서 사용자가 로컬 터미널로 동시에 브랜치를 왔다갔다 하면서 내가 체크아웃한 브랜치가 바뀐 적이 있다. 같은 작업 디렉토리를 사람과 동시에 쓰고 있을 수 있다는 걸 전제해야 한다.
- **`git add`는 항상 특정 파일만 지정할 것 (`git add -A`/`git add .` 금지).** 사용자가 로컬에 Firebase 연동(`GoogleService-Info.plist`, `plugins/withFmtConstevalFix.js`, `app.json`/`package.json`의 미커밋 로컬 변경)을 진행 중이며, 이 세션 내내 커밋되지 않은 채로 작업 디렉토리에 남아있다. 이건 사용자의 별도 작업이니 내 브랜치 커밋에 섞으면 안 된다.
- **`gh` CLI가 이 환경에 없다.** PR은 `git push -u origin <branch>` 후 `https://github.com/Mirror-Soul/RN/pull/new/<branch>` 링크와 미리 작성한 title/body를 안내하는 방식으로 처리했다. GitHub Issue도 마찬가지로 못 만드므로, 이슈 트래킹이 필요하면 `docs/*_BACKLOG.md` 같은 문서로 대체한다.
- **tsc 베이스라인은 의도적으로 88개 에러가 남아있다** (`main` 기준. `feat/123-dx-logic`에서는 svg.d.ts 덕에 34개로 줄어듦). 새 작업을 할 때는 절대 개수가 아니라 **작업 전/후 diff로 새 에러가 없는지만 확인**하면 된다 (`git stash` 전후 비교, 또는 그냥 건드린 파일만 `grep`).
- **7개 MVP 브랜치는 각각 `main`에서 독립적으로 분기했다.** 순서 상관없이 머지 가능하지만, `feat/mvp-biometric-consent` + `feat/mvp-age-gate`는 같은 파일(`Step1AccountContainer.tsx`, `step1.ts`, `consentContent.ts`, `ConsentDetailSheet.tsx`)을 건드려서 사소한 충돌이 예상된다 (§2 참고).

---

## 6. 고도화(Enhancement) 로드맵

### 6.1 지금 바로 RN 단독으로 해볼 만한 것
- [ ] `src/components/home/main/AvailableTimeCard.tsx`와 `src/features/profile/components/AvailableTimeCard.tsx` — 이름은 같지만 완전히 다른 두 컴포넌트를 하나로 통합 (디자인 결정 필요, `refactor/mvp-call-time-display`에서 상태만 통일하고 UI 병합은 안 함)
- [ ] `src/components/home/main/RefillModal.tsx`와 `src/features/profile/components/TimeRefillBottomSheet.tsx` — 마찬가지로 UI 자체를 하나로 병합
- [ ] `chore/mvp-app-store-config`의 `REPLACE_WITH_EAS_PROJECT_ID` placeholder 2곳 — `eas init` 실행 후 실제 값으로 교체
- [ ] Sentry DSN 실제 발급받아 `.env`에 설정하고 크래시 리포팅 동작 확인
- [ ] `docs/DX_TYPE_LINT_BACKLOG.md`에 정리된 남은 tsc 34개 / lint 14개 에러를 파일별로 점진적으로 해결 (한 번에 다 하지 말고 카테고리별로 작게)
- [ ] `docs/TODO_BACKLOG.md`의 나머지 TODO 6건 — 얼굴 스캔 라우트, 이미지 업로드 API 연동, 찜/공유 기능 스코프 확정 등
- [ ] `message-room`(채팅) — 지금은 100% 로컬 mock. `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md`의 설계를 참고해 실제 구현 착수 가능 (단, 백엔드 채팅 API가 없으므로 백엔드 협업 필요 항목과 겹침)

### 6.2 백엔드 협업이 필요한 것 (RN 단독으로 못 끝남)
- [ ] **실제 IAP/결제 연동** (Track 2) — `react-native-iap` 또는 RevenueCat, 서버 잔액 관리 API, `useAICallFlow.ts`의 `startCall()`에 사전 잔액 체크 추가. 현재 통화 시작 시 잔액 확인이 전혀 없어 실제로는 누구나 무제한 통화가 가능한 상태임을 재확인할 것
- [ ] 회원탈퇴 실제 API (30일 소프트 삭제 → 영구 삭제, 생체정보 원본 파일 삭제 포함) — `AccountDeleteScreen.tsx`는 여전히 `logger.debug` 한 줄짜리 mock
- [ ] 차단/신고의 서버 사이드 강제 — `feat/mvp-block-report`의 로컬 차단목록은 "내 화면에서 안 보이게"만 할 뿐, 상대가 실제로 연락 못 하게 막지는 못함
- [ ] PASS 본인인증 벤더 계약 및 실제 연동 (`fix/mvp-remove-fake-pass-verification`은 가짜 UI만 제거, 실제 연동은 비즈니스 결정 대기)
- [ ] 채팅 영속화 API (`docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md` §5 참고)
- [ ] 멀티기기(여러 휴대폰) 통화/채팅 — `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md`에 설계만 있고 구현은 시작 안 함. 백엔드 시그널링 서버를 1:1 relay에서 room 기반 브로드캐스트로 바꿔야 함

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

| 문서 | 위치(브랜치) | 내용 |
|---|---|---|
| `docs/DX_TYPE_LINT_BACKLOG.md` | `feat/123-dx-logic` | 남은 tsc/lint 에러 그룹별 정리 |
| `docs/TODO_BACKLOG.md` | `feat/123-dx-logic` | 백엔드/제품 결정 필요한 TODO 목록 |
| `docs/MULTI_DEVICE_CALL_CHAT_ARCHITECTURE.md` | `feat/123-dx-logic` | 멀티기기 통화/채팅 설계 제안 |
| `.claude/skills/dx-audit/SKILL.md` | `feat/123-dx-logic` | 재사용 가능한 DX 점검 체크리스트 스킬 |
| `docs/MVP_WORK_LOG_AND_ROADMAP.md` (이 문서) | `docs/mvp-work-summary` | 전체 작업 로그 + 고도화 로드맵 |
