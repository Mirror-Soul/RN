# src/features/account/ (인증/계정) — Claude Code 가이드

로그아웃, 회원탈퇴, 닉네임/계정 설정 도메인. 라우팅 자체의 함정(`/` 경로 충돌)은 `../../../app/CLAUDE.md` 참고 — 이 파일은 이 도메인의 로직 계약만 다룬다.

## `useAuthStore.logout()` 계약: 절대 throw하면 안 된다

`src/store/useAuthStore.ts`의 `logout()`은 `tokenStorage.clearAll()`이 실패해도 **반드시 에러를 삼키고** 메모리 상태(`isLoggedIn: false` 등)를 초기화해야 한다. 여기서 throw하면 호출부(아래 3곳)의 `router.replace('/login')`이 스킵되어, 로그아웃 시도 후에도 이전 화면에 그대로 남는다 — 실기기 QA에서 실제로 두 번 재현된 버그다 (`docs/MVP_WORK_LOG_AND_ROADMAP.md` §4.9 참고, 단 이건 진짜 근본 원인은 아니었고 라우트 충돌이 진짜 원인이었다 — 그래도 이 계약 자체는 별도로 지켜야 함).

**패턴**: 로그아웃/탈퇴를 호출하는 화면은 항상 다음 순서를 지킬 것 —
1. 서버 로그아웃 API 실패는 무시(로그만 남기고) — 서버 세션 정리가 안 돼도 로컬 로그아웃은 계속 진행
2. `useAuthStore.getState().logout()`도 실패할 수 있다고 가정하고 try/catch로 감싸기
3. 화면 이동(`router.replace('/login')`)은 **반드시 `finally`에서** — 위 두 단계가 어떤 이유로 실패해도 네비게이션은 항상 실행되어야 한다

## 로그아웃 진입점 3곳 (중복 구현됨 — 통합 필요)

- `app/(main)/index.tsx`의 `handleSettingPress` (임시 테스트 버튼)
- `src/features/account/AccountSettingsScreen.tsx`의 `performLogout` (실제 "로그아웃" 버튼)
- `src/features/account/AccountDeleteScreen.tsx`의 `performDeleteAccount` (탈퇴 성공 후 로그아웃 처리 포함)

세 곳 모두 위 계약을 지키도록 각자 try/finally로 구현돼 있지만, 로직이 사실상 동일해서 중복이다. **`feat/137-auth-hardening` 브랜치에 이미 `authService.performLogout()` 공유 헬퍼가 구현되어 있으니**, 두 브랜치를 나중에 합칠 때 그쪽 구현으로 3곳을 통일할 것 — 새로 만들지 말 것.

## 중복 요청 가드

`AccountDeleteScreen.tsx`(탈퇴), `TimeRefillBottomSheet.tsx`(시간 구매, `../profile/`)는 `isPending` 같은 렌더 파생 상태만으로 연타를 막으면 리렌더 사이의 좁은 레이스 윈도우에서 중복 요청이 나갈 수 있다. `useRef` 동기 락을 mutation 호출 직전에 설정하고 `finally`에서 해제하는 패턴을 쓴다 (계정탈퇴/결제처럼 되돌리기 어렵거나 중복 과금 위험이 있는 액션에 우선 적용, 나머지는 `isPending` 체크만으로 충분).
