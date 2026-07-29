# mirror-soul (RN/Expo 앱) — Claude Code 가이드

모노레포 전체 공통 사항(저장소 구조, git 습관, 백엔드 API 정본 위치, iOS 빌드 트러블슈팅)은 루트 `../CLAUDE.md`를 먼저 볼 것. 이 파일은 RN 앱 코드 자체의 컨벤션만 다룬다.

## API 연동 패턴 (새 도메인 추가 시 그대로 따를 것)

1개 도메인 = `src/types/api/<domain>.ts` + `src/services/<domain>Service.ts`. `src/services/profileService.ts` + `src/types/api/profile.ts`가 가장 최근에 만들어진 정본 예시다 (`src/services/callService.ts`도 참고).

- **타입 파일**: `// ── METHOD /path ──` 주석 헤더로 엔드포인트별 구분. Request/Result 인터페이스 + `ApiResponse<Result>`로 감싼 Response 타입. **필드명은 백엔드 DTO와 정확히 동일하게** — 루트 `.claude/artifacts/backend-schema.json`이 정본.
- **서비스 파일**: `apiClient`(`src/services/apiClient.ts`, axios 인스턴스, 토큰 갱신/에러 정규화 인터셉터 내장) 호출 + `logger.debug/info/error` + try/catch 후 rethrow. `response.data`(전체 `ApiResponse<T>` envelope, `.result`로 미리 언랩하지 않음)를 반환.
- **에러 처리**: `src/utils/apiErrorCode.ts`의 `getErrorDisplayMessage(error, fallback)`을 쓸 것 — 백엔드가 이미 적절한 한글 메시지를 `error.message`로 보내주므로 번역하지 말고, 코드별로 FE 쪽 동작을 다르게 하고 싶을 때만(`isConflictError`, `isAuthError` 등) 분기한다. `ApiErrorCode` 타입에 47개 백엔드 코드가 다 들어있으니 매직 스트링 쓰지 말 것.
- **화면 ↔ API 연동 지점**: 화면 컴포넌트는 건드리지 않고, 화면과 zustand 스토어 사이의 **얇은 훅**(`useNotificationSettings.ts`, `useVoiceAudioSettings.ts` 패턴)이나 **스토어 자체의 async 액션**(`useCallTimeStore.fetchRemainingTime`, `useAccountStore.fetchProfile` 패턴)에서 API를 호출한다. 스토어에 `fetchXxx()`(GET, 실패 시 조용히 무시하고 기존 값 유지) 액션을 추가하는 게 표준 형태.
- **백엔드 필드 ↔ FE 개념이 정확히 안 맞을 때**: FE에 대응 UI가 없는 백엔드 필드는 스토어에 "숨김 필드"로 들고 있다가 PATCH 시 최신 값을 그대로 같이 보낸다(`useVoiceAudioStore.opponentVoiceVolume`, `useNotificationStore.missedCallNotificationEnabled` 참고 — 백엔드가 `@NotNull`로 두 필드를 동시에 요구하는데 FE엔 하나만 UI가 있는 경우의 처리법).

## 아직 API가 없는 도메인 (구현 시 위 패턴 그대로 적용)

`.claude/artifacts/analysis-report.md` §6 참고 — Chat, Meeting(실사용자 매칭 수락/거절), PushDevice, Evolve, Admin은 백엔드 API는 있지만 FE 서비스가 없다. 관련 화면은 전부 mock 데이터/dead-end 핸들러로 되어 있다 (`docs/MVP_WORK_LOG_AND_ROADMAP.md` §6 참고).

## 상태 관리

Zustand. `src/store/*.ts` — 화면별 로컬 UI 상태가 아니라 여러 화면이 공유하는 상태만 스토어로 뺀다. `expo-secure-store` 기반 `persist` 미들웨어를 쓰는 스토어는 `useVoiceAudioStore.ts`의 `secureStorage` 어댑터 패턴을 재사용할 것 (AsyncStorage 미설치 프로젝트).

## 빌드/실행

```bash
npx expo run:ios -d      # 실기기 빌드+설치 (설치 단계 버그는 루트 CLAUDE.md 참고 — ios-deploy 우회 필요할 수 있음)
npx expo run:android -d  # 실기기 빌드+설치 (정상 동작)
npx expo start            # 이미 설치된 dev client에 JS만 갱신 (네이티브/app.json 변경 없을 때는 이것만으로 충분)
npm run lint               # expo lint
npx tsc --noEmit           # 타입체크 (package.json에 별도 typecheck 스크립트 없음)
```

## 문서

- `docs/MVP_WORK_LOG_AND_ROADMAP.md` — 전체 작업 이력 + 남은 고도화 로드맵. 새 작업 시작 전에 먼저 확인.
- `PUSH_NOTIFICATION_ARCHITECTURE.md`, `REANIMATED_ACCORDION_ARCHITECTURE.md`, `ANDROID_PORTING_NOTES.md`, `VOICE_AUDIO_TODOS.md` — 특정 기능 설계/이슈 메모. `PUSH_NOTIFICATION_ARCHITECTURE.md`는 실제 백엔드 `PushDeviceController`(`/push/devices`)와 다른 URL 스킴(`/notifications/*`)을 제안하고 있으니 실제 구현 시 `backend-schema.json` 기준으로 맞출 것.
