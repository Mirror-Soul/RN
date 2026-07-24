# Mirror Soul Android 포팅 진행 상황

브랜치: `feat/117-android`
워크스페이스: `/Users/shinwookkang/Developer/mirror-soul-new`
RN 앱 경로: `/Users/shinwookkang/Developer/mirror-soul-new/mirror-soul`

## 실행 명령어

```bash
cd /Users/shinwookkang/Developer/mirror-soul-new/mirror-soul
JAVA_HOME="/Users/shinwookkang/Library/Java/JavaVirtualMachines/temurin-17.0.18/Contents/Home" ANDROID_HOME="$HOME/Library/Android/sdk" npx expo run:android
```

기기 인식이 안 되면: `adb kill-server && adb start-server && adb devices -l`로 확인 (USB 재연결/디버깅 허용 팝업 확인).

## 완료된 것

### Phase 1 (환경 구성) — 완료
- Android Studio + SDK, JAVA_HOME(JDK17)/ANDROID_HOME 환경변수, 기기(SM_S931N / R3CY603WZVP) 연결
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
1. **지역 선택 드롭다운 투명/배경 겹침** + **직업 선택 오터치**: `position:absolute` + `elevation`/`zIndex` 트릭이 Android에서 터치 우선순위를 보장 못해 발생. `SelectDropdownModal`(네이티브 Modal 기반 공통 컴포넌트) + `useDropdownAnchor`(토글 버튼 위치 측정 훅) 신설. 토글 버튼 바로 아래에 앵커링되도록 최종 수정 완료 (초기엔 화면 중앙에 떴는데 사용자 피드백 받아 앵커 방식으로 변경).
2. **Face Scan START SCAN 버튼 스크롤 불가**: `app/signup/face-scan.tsx`에 `ScrollView` 추가.
3. **얼굴 스캔 업로드 "Network request failed" 반복**: `src/services/s3Service.ts`에서 `fetch().blob()` 방식이 Android 큰 파일에서 실패 → `expo-file-system`의 `uploadAsync(BINARY_CONTENT)`로 교체.
4. 음성/STT는 정상 확인됨 (수정 불필요).

**⚠️ 마지막 앵커 방식 드롭다운 수정은 기기에서 아직 최종 확인 안 됨 — 다음 세션에서 제일 먼저 확인 필요.**

## 남은 작업

### Phase 5 (코드 정리) — 미착수
1. `app.json`의 `android.permissions` 배열에 중복 항목 3개 있음 (RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, CAMERA가 각각 2번씩) — 제거 필요
2. `src/components/signup/steps/Step4_Interview/components/InterviewAIBox.tsx` 2번째 줄 `import { BlurView } from 'expo-blur';` 미사용 — 제거 필요 (실제 미사용 여부 재확인 후 제거)

### 추가로 나온 미검증 리스크 (Phase 4 조사 중 발견, 아직 문제 재현 안 됐지만 참고)
- WebRTC 통화 중 오디오 라우팅(스피커폰/이어피스 전환) 코드가 없음 — Android에서 소리 방향 이상하면 이 부분 확인
- `react-native-vision-camera-face-detector`, `react-native-webrtc`가 `app.json` plugins에 명시적 등록 안 됨(autolinking 의존) — 크래시 나면 확인 지점

## 다음 세션 시작 프롬프트 예시

```
mirror-soul/ANDROID_PORTING_NOTES.md 읽고 이어서 진행해줘.
지금까지 완료된 Phase 1~4 유지하면서, 먼저 지역/직업 드롭다운 앵커 위치가
기기에서 잘 나오는지 확인부터 하고, Phase 5(코드 정리) 진행해줘.
```
