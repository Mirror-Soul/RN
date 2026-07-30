# app/ (라우팅) — Claude Code 가이드

`expo-router` 파일 기반 라우팅. 이 디렉터리에서 화면을 추가/이동/rename 하기 전에 아래 함정을 먼저 확인할 것.

## `/` 경로 충돌 위험 (2026-07-30에 실제로 버그를 냈던 패턴)

**그룹(`(main)` 등) 안의 `index.tsx`는 그 그룹의 경로뿐 아니라, 앱 루트 `/`에도 동시에 매칭될 수 있다.** 그룹 세그먼트는 URL에 나타나지 않기 때문에, `app/(main)/index.tsx`(홈 탭)는 `/(main)`과 `/` 양쪽에 다 걸린다.

과거 `app/index.tsx`가 로그인 화면이었을 때, 이 두 화면이 `/`를 두고 충돌했다. `(main)` 안에 있는 상태에서 `router.replace('/')`를 호출하면 라우터가 "이미 `/`에 해당하는 화면(홈)에 있다"고 판단해 로그인 화면으로 넘어가지 않았다 — 로그아웃/회원탈퇴/세션만료 시 **토큰은 정리되는데 화면은 그대로 남는** 버그로 나타났다. `.expo/types/router.d.ts`(생성 파일)에 `{ pathname: '/(main)' | '/' }`처럼 두 경로가 한 타입에 같이 나오면 이 충돌을 의심할 것.

**수정 방향**: 로그인 화면을 `app/login.tsx`로 옮겨 고유 경로(`/login`)를 확보했다. 지금은 `/`가 `(main)` 홈 탭에만 매칭된다.

**규칙**: 네비게이션 목적지는 항상 명시적 경로를 쓸 것 — 로그인은 `/login`, 홈은 `/(main)`. 절대 `/`를 "로그인 화면"이나 "루트"의 의미로 하드코딩하지 말 것 (그룹 index와 다시 충돌할 수 있다). 새 최상위 그룹을 추가할 때도 그 그룹의 `index.tsx`가 앱 루트 `/`와 충돌하지 않는지 `.expo/types/router.d.ts`로 확인할 것 (`npx expo start`를 짧게 돌리면 재생성됨, gitignore된 파일이라 커밋 대상 아님).

## 구조

- `app/_layout.tsx` — 최상위 `Stack`. `useAuthStore`의 `isLoggedIn`/`userStatus`를 구독해서 인증 상태에 따라 `/login`(미인증), `/(main)`(인증+ACTIVE), 온보딩 라우트(인증+ONBOARD_*)로 리다이렉트하는 가드가 여기 있다.
- `app/login.tsx` — 로그인/회원가입 탭 전환 화면 (구 `app/index.tsx`).
- `app/(main)/` — 인증 후 메인 탭 그룹 (`Tabs` 네비게이터, `_layout.tsx` 참고). 홈 탭이 `index.tsx`.
- `app/signup/` — 온보딩 단계별 화면 (`_layout.tsx`가 자체 스택).
- 세션 만료(401 refresh 실패) 시 리다이렉트는 `app/_layout.tsx`가 아니라 `src/services/apiClient.ts`의 인터셉터가 직접 `router.replace('/login')`을 호출한다 — 화면이 아니라 axios 인터셉터에서 네비게이션이 발생하는 예외적인 지점.
