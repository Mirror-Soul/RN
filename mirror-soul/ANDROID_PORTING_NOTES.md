# Mirror Soul Android 포팅 진행 상황

브랜치: `feat/117-android`
RN 앱 경로: `mirror-soul/` (레포 루트 기준)

## 실행 명령어

```bash
cd mirror-soul
JAVA_HOME="<JDK_17_HOME>" ANDROID_HOME="<ANDROID_SDK_ROOT>" npx expo run:android
```

기기 인식이 안 되면: `adb kill-server && adb start-server && adb devices -l`로 확인 (USB 재연결/디버깅 허용 팝업 확인).

## 완료된 것

### Phase 1 (환경 구성) — 완료
- Android Studio + SDK, JAVA_HOME(JDK17)/ANDROID_HOME 환경변수, 실기기 연결
- `android/gradle.properties`, `app.json`(expo-build-properties)에 `minSdkVersion: 26`
- 첫 빌드 및 기기 실행 성공

### Phase 2 (폰트) — 완료, 커밋 `4bc7fba`
- `@expo-google-fonts/inter` 설치, weight별(400/500/600/700/900) TTF를 `assets/fonts/`에 배치
- `app.json`의 `expo-font` config plugin으로 "Inter" 네이티브 폰트 패밀리 등록 (useFonts() 불필요, 234곳 기존 코드 무수정)
- 기기에서 Inter 폰트/굵기 정상 렌더링 확인됨

### Phase 3 (레이아웃) — 완료, 커밋 `d2df487`
- `app/signup/_layout.tsx`: RN 기본 SafeAreaView/StatusBar → `react-native-safe-area-context`/`expo-status-bar`로 교체 (Android 수동 패딩 하드코딩 제거)

### Phase 4 (기능 검증 + 버그 수정) — 완료, 커밋 `814ad20`, `8e41a56`, `09081a4`
사용자가 기기 테스트 중 발견한 4개 버그 수정:
1. **지역 선택 드롭다운 투명/배경 겹침** + **직업 선택 오터치**: `position:absolute` + `elevation`/`zIndex` 트릭이 Android에서 터치 우선순위를 보장 못해 발생. `SelectDropdownModal`(네이티브 Modal 기반 공통 컴포넌트) + `useDropdownAnchor`(토글 버튼 위치 측정 훅) 신설. 토글 버튼 바로 아래에 앵커링되도록 수정, 기기에서 최종 확인 완료.
2. **Face Scan START SCAN 버튼 스크롤 불가**: `app/signup/face-scan.tsx`에 `ScrollView` 추가.
3. **얼굴 스캔 업로드 "Network request failed" 반복**: `src/services/s3Service.ts`에서 `fetch().blob()` 방식이 Android 큰 파일에서 실패 → `expo-file-system`의 `uploadAsync(BINARY_CONTENT)`로 교체.
4. 음성/STT는 정상 확인됨 (수정 불필요).

### Phase 5 (코드 정리) — 완료, 커밋 `3532d3d`
- `app.json`의 `android.permissions` 배열 중복 항목 3개(RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, CAMERA 각 2번씩) 제거
- `InterviewAIBox.tsx`의 미사용 `import { BlurView } from 'expo-blur';` 제거

### Phase 6 (기기 실사용 버그 수정) — 완료, 커밋 `6d81ed1`, `8d50800`
1. **회원가입 화면 텍스트가 검정 배경에 묻힘**: signup 배경(`SignupBackground`)이 항상 검정 고정인데 텍스트는 시스템 라이트/다크 모드를 따라가 라이트 모드 기기에서 텍스트가 배경과 겹쳐 안 보였음. `useThemeColors`에 `ForceDarkThemeContext` 추가해 signup 플로우 전체를 항상 다크 테마로 강제.
2. **지역/직업 드롭다운이 토글 버튼 중간에서 튀어나옴**: `SelectDropdownModal`의 진입 애니메이션 오프셋이 앵커 GAP보다 커서 발생 → 오프셋을 GAP과 동일하게 맞춰 버튼 바로 아래 경계에서 시작하도록 수정.

### Phase 7 (CodeRabbit 리뷰 반영) — 완료
- `s3Service.ts`: `uploadAsync`에 기본 타임아웃이 없어 네트워크 장애 시 요청이 끝없이 대기하며 `useFaceScanUpload`의 finally가 실행되지 않아 finalizing 로딩 UI가 풀리지 않는 문제 → `createUploadTask` + 수동 타임아웃(60초)으로 교체, 타임아웃 시 `cancelAsync()`로 강제 종료
- `face-scan.tsx`: `ScrollView`에 `bounces={false}`(iOS 전용)만 있고 Android용 `overScrollMode`가 없어 Android에서 오버스크롤 효과가 그대로 남음 → `overScrollMode="never"` 추가
- `SelectDropdownModal.tsx`: 트리거가 화면 하단에 가까우면 `maxHeight` 하한(120)만 걸리고 `top`은 그대로라 패널이 화면 밖으로 넘칠 수 있음 → `top`을 clamp해 최소 높이가 항상 화면 안에 들어오도록 수정
- 이 문서의 개인 로컬 경로/기기 식별자 제거, 플레이스홀더로 교체

## 남은 작업

### 검토했으나 반영하지 않은 리뷰 항목
- **`app.json`의 `expo-font` 설정을 `android.fonts`로 중첩하라는 제안**: 현재 설치된 `expo-font@14.0.12` 플러그인 소스(`plugin/build/withFonts.js`)를 직접 확인한 결과, 최상위 `fonts`와 `android.fonts`를 병합(`[...props.fonts, ...props.android?.fonts]`)해서 동일하게 처리함 — 즉 최상위 `fonts`만으로도 Android에 정상 반영되며 실제로 Phase 2에서 기기 확인까지 끝남. 이 버전 기준으로는 잘못된 지적이라 판단해 반영하지 않음. 추후 `expo-font` 메이저 업데이트 시 재확인 권장.

### 추가로 나온 미검증 리스크 (아직 문제 재현 안 됐지만 참고, 액션 불필요)
- WebRTC 통화 중 오디오 라우팅(스피커폰/이어피스 전환) 코드가 없음 — Android에서 소리 방향 이상하면 이 부분 확인
- `react-native-vision-camera-face-detector`, `react-native-webrtc`는 Expo config plugin을 제공하지 않는 패키지라 `app.json` plugins 등록 자체가 불필요함을 확인함 (autolinking만으로 정상, 빌드 성공 확인됨)

## 다음 세션 시작 프롬프트 예시

```
mirror-soul/ANDROID_PORTING_NOTES.md 읽고 이어서 진행해줘.
Phase 1~7 완료 상태 유지하면서, 남은 미검증 리스크 중 필요한 것부터 확인해줘.
```
