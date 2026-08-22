# mirror-soul (RN/Expo 앱) — Claude Code 가이드

모노레포 전체 공통 사항(저장소 구조, git 습관, 백엔드 API 정본 위치, iOS 빌드 트러블슈팅)은 루트 `../CLAUDE.md`를 먼저 볼 것. 이 파일은 RN 앱 코드 자체의 컨벤션만 다룬다.

## API 연동 패턴 (새 도메인 추가 시 그대로 따를 것)

1개 도메인 = `src/types/api/<domain>.ts` + `src/services/<domain>Service.ts`. `src/services/profileService.ts` + `src/types/api/profile.ts`가 가장 최근에 만들어진 정본 예시다 (`src/services/callService.ts`도 참고).

- **타입 파일**: `// ── METHOD /path ──` 주석 헤더로 엔드포인트별 구분. Request/Result 인터페이스 + `ApiResponse<Result>`로 감싼 Response 타입. **필드명은 백엔드 DTO와 정확히 동일하게** — 루트 `.claude/artifacts/backend-schema.json`이 정본.
- **서비스 파일**: `apiClient`(`src/services/apiClient.ts`, axios 인스턴스, 토큰 갱신/에러 정규화 인터셉터 내장) 호출 + `logger.debug/info/error` + try/catch 후 rethrow. `response.data`(전체 `ApiResponse<T>` envelope, `.result`로 미리 언랩하지 않음)를 반환.
- **에러 처리**: `src/utils/apiErrorCode.ts`의 `getErrorDisplayMessage(error, fallback)`을 쓸 것 — 백엔드가 이미 적절한 한글 메시지를 `error.message`로 보내주므로 번역하지 말고, 코드별로 FE 쪽 동작을 다르게 하고 싶을 때만(`isConflictError`, `isAuthError` 등) 분기한다. `ApiErrorCode` 타입에 47개 백엔드 코드가 다 들어있으니 매직 스트링 쓰지 말 것.
- **화면 ↔ API 연동 지점 (2026-07-30 react-query 마이그레이션 이후 — 최신 표준)**: 서버 상태는 zustand가 아니라 **`@tanstack/react-query`**(`useQuery`/`useMutation`)로 관리한다. `src/features/profile/hooks/useProfileQuery.ts`(GET), `src/features/profile/hooks/useBuyTimeMutation.ts`(POST), `src/features/voice-audio/hooks/useVoiceAudioSettings.ts`(GET+PATCH 결합형)가 정본 예시. 화면 컴포넌트는 건드리지 않고, 화면과 API 사이의 **훅 하나**(쿼리+뮤테이션 다 포함)에서 처리한다.
  - **인증(auth) 도메인도 동일 패턴을 따른다** (`feat/137-auth-hardening`, 2026-07-30): `src/features/auth/hooks/useLoginMutation.ts`, `src/components/signup/steps/Step1_Account/hooks/useCreateAccountMutation.ts`가 예시 — `onSuccess`에서 `useAuthStore.getState().login(...)`을 호출해 인증 상태 전환까지 mutation이 책임진다. 단, `useAuthStore` 자체는 아래 "zustand에 남기는 것" 이유로 계속 zustand에 남는다.
  - **로그아웃은 `src/services/authService.ts`의 `performLogout()`을 항상 재사용할 것** — 서버 세션 정리(실패 무시) → `useAuthStore.getState().logout()` → `queryClient.clear()` 3단계를 한 곳에 캡슐화했다. 새 로그아웃 진입점을 추가할 때 이 3단계를 직접 인라인하지 말 것 (과거에 이걸 빠뜨려 캐시가 안 지워지는 버그가 있었다).
  - 쿼리 키는 `['profile', '<subdomain>']` 네임스페이스 컨벤션(`me`/`time`/`audioSettings`/`alarmSettings`/`accountInfo`)을 따를 것 — `src/services/queryClient.ts`의 싱글턴 `QueryClient`를 공유한다(`app/_layout.tsx`와 `apiClient.ts`(세션 만료 시 `queryClient.clear()`) 양쪽에서 import).
  - `queryFn`에서 `(await getXxx()).result`로 언랩해서 반환(서비스 레이어는 안 건드리고 훅에서 언랩) — `profileService.ts`는 여전히 `ApiResponse<T>` 전체 envelope을 반환하는 컨벤션을 유지한다.
  - 캐시 갱신은 백엔드가 최신값을 돌려주면 `mutation.onSuccess`에서 `queryClient.setQueryData(key, response.result)`로 직접 반영(재조회 불필요). 백엔드가 `Void`만 반환하면(예: 닉네임 변경) 클라이언트가 이미 아는 값으로 낙관적 갱신(`useModifyNicknameMutation.ts` 참고).
  - **더 이상 쓰지 않는 것들**: 수동 in-flight dedup/캐시(`fetchGuard.ts`, 삭제됨 — react-query가 기본 제공), `useAccountStore.ts`/`useCallTimeStore.ts`(삭제됨, 전부 react-query 캐시로 대체).
- **zustand에 남기는 것**: React 트리 밖에서 동기적으로(`getState()`) 읽어야 하는 상태(`useVoiceAudioStore.speechSpeed` — `useAICallFlow.ts`가 훅 없이 즉시 읽을 미러용, 진실의 원천은 여전히 react-query 캐시)나 서버 대응이 아예 없는 순수 로컬 상태(`useNotificationStore.eventAlert`)만.
- **백엔드 필드 ↔ FE 개념이 정확히 안 맞을 때**: FE에 대응 UI가 없는 백엔드 필드는 `mutationFn` 안에서 `queryClient.getQueryData(key)`로 캐시의 현재 값을 읽어 PATCH 바디에 그대로 같이 실어 보낸다(`useVoiceAudioSettings.ts`의 `opponentVoiceVolume`, `useNotificationSettings.ts`의 `missedCallNotificationEnabled` 참고 — 백엔드가 `@NotNull`로 두 필드를 동시에 요구하는데 FE엔 하나만 UI가 있는 경우의 처리법).
- **에러 UX**: 마이페이지 도메인은 `useToast()`(`src/components/common/Toast/ToastProvider.tsx`)로 토스트 표시 — `useQuery`는 v5부터 `onError` 콜백이 없으므로 컴포넌트에서 `useEffect(() => { if (query.isError) ... })`로 처리(`useInterviewQuestions.ts` 패턴), `useMutation`은 `onError` 콜백을 그대로 씀. 온보딩처럼 "데이터 없인 진행 불가"인 화면은 Alert.alert+재시도가 여전히 맞는 패턴(`useInterviewQuestions.ts`) — 두 패턴이 의도적으로 공존한다.
- **`query.data`가 없을 때 0/기본값으로 포맷하지 말 것**: 로딩 중과 조회 실패를 서버가 실제로 0(또는 기본값)을 반환한 것과 혼동하면 사용자가 잔액/설정값을 잘못 인지한다. `isLoading`/`isError`를 구분해서 로딩 중엔 placeholder, 실패 시엔 탭하면 `refetch()`하는 재시도 UI를 보여줄 것 (`src/components/home/main/AvailableTimeCard.tsx` 참고).
- **비멱등 mutation(결제, 계정탈퇴 등)은 `isPending`만으로 중복 요청을 막지 말 것**: `isPending`은 리렌더 이후에나 반영되므로 리렌더 사이의 좁은 레이스 윈도우에서 중복 호출이 가능하다. `useRef` 동기 락을 mutation 호출 직전에 세우고 `finally`에서 해제하는 패턴을 병행할 것 (`src/features/account/AccountDeleteScreen.tsx`, `src/features/profile/components/TimeRefillBottomSheet.tsx` 참고).
- **FE에 UI가 없는 숨김 필드를 캐시 없이 임의 기본값으로 PATCH하지 말 것**: `queryClient.getQueryData(key)`가 아직 `undefined`인데(조회 전) 사용자가 다른 필드를 변경하면, `mutationFn`이 숨김 필드에 임의 기본값을 채워 넣어 실제 서버값을 덮어쓸 수 있다. 캐시가 없으면 `mutationFn`이 reject하고, 조회 완료 전엔 해당 토글/컨트롤 자체를 비활성화할 것 (`src/features/notification/hooks/useNotificationSettings.ts`, `src/features/voice-audio/hooks/useVoiceAudioSettings.ts` 참고).

## 아직 API가 없는 도메인 (구현 시 위 패턴 그대로 적용)

`.claude/artifacts/analysis-report.md` §6 참고(스냅샷이라 최신 아님) — Chat, Meeting(실사용자 매칭 수락/거절), PushDevice, Admin은 백엔드 API는 있지만 FE 서비스가 없다. 관련 화면은 전부 mock 데이터/dead-end 핸들러로 되어 있다 (`docs/MVP_WORK_LOG_AND_ROADMAP.md` §6 참고).

**Evolve 도메인은 이 목록에서 제외** — `evolveService.ts`/`types/api/evolve.ts`에 twinSync/voice 외에도 가치관 밸런스 게임(`GET /evolve/value-balance`, `POST /evolve/value-balance/{id}/answer`)까지 연동 완료됨(2026-08-14). `.claude/artifacts/backend-schema.json`엔 이 엔드포인트들이 반영 안 돼 있으니(스냅샷 이후 추가) 참고할 때 실제 코드(`EvolveController.java`)를 볼 것.

## 상태 관리

**서버 상태(API로 가져오는 데이터)는 react-query, 그 외 공유 로컬 상태는 zustand.** 위 "API 연동 패턴" 절 참고. zustand는 `src/store/*.ts` — 화면별 로컬 UI 상태가 아니라 여러 화면이 공유하는 순수 로컬 상태, 또는 훅 밖에서 동기적으로 읽어야 하는 상태만 스토어로 뺀다. `expo-secure-store` 기반 `persist` 미들웨어를 쓰는 스토어는 `useVoiceAudioStore.ts`의 `secureStorage` 어댑터 패턴을 재사용할 것 (AsyncStorage 미설치 프로젝트).

## 빌드/실행

```bash
npx expo run:ios -d      # 실기기 빌드+설치 (설치 단계 버그는 루트 CLAUDE.md 참고 — ios-deploy 우회 필요할 수 있음)
npx expo run:android -d  # 실기기 빌드+설치 (정상 동작)
npx expo start            # 이미 설치된 dev client에 JS만 갱신 (네이티브/app.json 변경 없을 때는 이것만으로 충분)
npm run lint               # expo lint
npx tsc --noEmit           # 타입체크 (package.json에 별도 typecheck 스크립트 없음)
npx jest                   # 유닛 테스트 (jest-expo 프리셋, package.json에 "test" 스크립트로도 등록됨)
```

**`npx expo start --web`은 이 프로젝트에서 항상 크래시난다 (2026-07-30 확인, 근본 원인 확정됨)** — `react-native-webrtc`(통화 기능에 사용)가 웹 구현체를 아예 제공하지 않아 `RTCView.js`에서 `_reactNative.requireNativeComponent is not a function`으로 Metro 번들링 자체가 실패한다. iOS 시뮬레이터가 막혀 있는 것(루트 CLAUDE.md의 iOS 빌드 트러블슈팅 참고)과 별개로, **웹 미리보기도 이 앱을 검증하는 유효한 방법이 아니다** — 매번 새로 발견하지 말 것. UI 검증은 실기기(`ios-deploy` 경유, 루트 CLAUDE.md 3번 항목) 경로만 유효하다.

## 문서

- `docs/MVP_WORK_LOG_AND_ROADMAP.md` — 전체 작업 이력 + 남은 고도화 로드맵. 새 작업 시작 전에 먼저 확인.
- `PUSH_NOTIFICATION_ARCHITECTURE.md`, `REANIMATED_ACCORDION_ARCHITECTURE.md`, `ANDROID_PORTING_NOTES.md`, `VOICE_AUDIO_TODOS.md` — 특정 기능 설계/이슈 메모. `PUSH_NOTIFICATION_ARCHITECTURE.md`는 실제 백엔드 `PushDeviceController`(`/push/devices`)와 다른 URL 스킴(`/notifications/*`)을 제안하고 있으니 실제 구현 시 `backend-schema.json` 기준으로 맞출 것.
- **도메인별 하위 `CLAUDE.md`** — 그 디렉터리에서 작업 중이면 이 파일과 함께 자동으로 로드된다: `app/CLAUDE.md`(라우팅 — `/` 경로 충돌 위험), `src/features/account/CLAUDE.md`(인증/로그아웃 계약, 진입점 중복 현황), `src/features/push/CLAUDE.md`(Android 알림 채널 생성 순서, cold-start 딥링크와 인증 리다이렉트 레이스, 로그아웃 시 기기 해제 직렬화). 새 도메인 작업 중 반복되는 함정을 발견하면 관련 디렉터리에 새 `CLAUDE.md`를 추가할 것 — 이 파일 하나에 계속 이어 붙이지 말 것.
