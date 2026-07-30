# mirror-soul-new 모노레포 — Claude Code 가이드

AI 트윈(얼굴/음성/성격 데이터로 만든 디지털 트윈) 기반 데이팅 앱. RN 앱이 트윈과 통화하며 상대를 간접적으로 알아가고, 통화 시간을 구매해서 쓰는 유료 모델이다.

## 저장소 구조 (일반적인 모노레포가 아님 — 반드시 먼저 확인)

- `mirror-soul/` — React Native/Expo 앱. **이 루트 저장소(`mirror-soul-new`)에 일반 디렉터리로 직접 커밋된다 (submodule 아님).** 자체 `.git`이 없다.
- `mirror-soul-back/` — Spring Boot 백엔드. **git submodule.**
- `mirror-soul-AI/` — AI 서버. **git submodule.**
- `mirror-soul-infra/` — 인프라 코드. **git submodule.**

`git status`에서 3개 submodule이 항상 "modified (new commits)"로 뜨는 건 흔한 일이고, 대개 이 세션의 작업과 무관하다 — **먼저 `git -C mirror-soul-back status`(등)로 실제로 뭔가 바뀐 게 있는지 확인하기 전에는 커밋에 포함시키지 말 것.**

각 하위 디렉터리(특히 `mirror-soul/`)는 자체 `CLAUDE.md`를 가질 수 있다 — 그 디렉터리에서 작업 중이면 함께 확인할 것.

## 이 저장소에서 일할 때 지켜야 할 것

- **`git add`는 항상 특정 파일만 지정.** `git add -A`/`git add .` 금지 — submodule 포인터 변경, `.claude/`, 사용자의 로컬 미완성 작업(예: 별도 Firebase 실험)이 섞여 들어갈 수 있다.
- **브랜치 전환 시 `git branch --show-current`로 재확인.** 사용자가 같은 워킹 디렉터리를 터미널로 동시에 쓸 수 있다.
- **이 환경엔 `gh` CLI가 없다.** PR은 `git push -u origin <branch>` 후 `https://github.com/Mirror-Soul/RN/compare/main...<branch>?expand=1` 링크와 미리 작성한 title/body를 사용자에게 안내하는 방식으로 대체한다. GitHub Issue도 마찬가지로 못 만든다.
- **커밋 전 반드시 diff를 스캔.** 이전 세션에서 pre-commit 훅이 없어 `console.log`/미완성 코드가 섞여 들어간 적이 있다.

## 백엔드 API 정본 (재조사하지 말고 이것부터 참고)

`.claude/artifacts/backend-schema.json`과 `.claude/artifacts/analysis-report.md`에 백엔드 전체(12개 컨트롤러, 46개 엔드포인트, 47개 에러코드)를 **Service 계층 소스까지 전수 검증**해서 정리해 둔 최신 스냅샷이 있다.

- `backend-schema.json`: 각 엔드포인트의 정확한 요청/응답 DTO 필드, 검증 어노테이션, 그리고 **실제로 발생 가능한 에러코드**(`possibleErrorCodes`, `verified: true`) — Service 계층의 모든 `throw new GeneralException(...)` 호출부를 추적해서 검증한 것이라 신뢰할 수 있다.
- `analysis-report.md`: 응답 래퍼(`ApiResponse<T>` = `isSuccess/code/message/result/error`)의 실제 구조, 프론트-백엔드 API 커버리지 격차, 아키텍처 특이사항(예: `CLONE_NOT_FOUND`가 404가 아닌 400을 씀, 9개 에러코드가 정의만 되고 전혀 안 쓰임) 서술.

새 프론트 API 연동 작업을 시작하기 전에 백엔드 컨트롤러/DTO를 직접 다시 읽지 말고 **먼저 이 두 파일을 확인**할 것. 단, 이 파일들은 스냅샷이므로 백엔드 코드가 그 이후 바뀌었을 수 있다는 점은 감안 — 의심되면 해당 부분만 실제 코드로 재확인.

프론트 API 서비스 레이어의 확립된 패턴(어떤 도메인부터 어떻게 만드는지)은 `mirror-soul/CLAUDE.md` 참고.

## `mirror-soul/` iOS 빌드에서 반복해서 겪은 문제 (원인/해결 확정됨)

1. **`npx expo prebuild --clean`이 크래시** — `app.json`의 `expo-font` 플러그인은 `{fontFamily, fontDefinitions}` 객체가 아니라 **경로 문자열 배열**을 받아야 한다. 이미 고쳐져 있음 — 같은 실수를 반복하지 말 것.
2. **빌드 마지막 단계(`Bundle React Native code and images`)에서 `sentry-cli` 실패** — 실제 Sentry 프로젝트가 없으면 소스맵 자동 업로드가 항상 실패한다. `mirror-soul/plugins/withSentryDisableAutoUpload.js`가 prebuild 시 `ios/.xcode.env.local`에 `SENTRY_DISABLE_AUTO_UPLOAD=true`를 자동으로 써준다 (이미 `app.json` plugins에 등록되어 있음). 실제 Sentry 프로젝트를 연동하면 이 플러그인을 제거할 것.
3. **`npx expo run:ios -d`가 빌드는 성공하는데 기기 설치에서 `TypeError: Cannot convert object to primitive value` (LockdowndClient)로 실패** — Expo CLI 자체의 알려진 업스트림 버그([expo/expo#46123](https://github.com/expo/expo/issues/46123)), 이 프로젝트 코드와 무관. 우회법: `brew install ios-deploy` 후, 빌드가 끝나고 설치 단계에서 에러가 나도 무시하고 `ios-deploy --bundle "$(find ~/Library/Developer/Xcode/DerivedData -maxdepth 1 -iname 'mirrorsoul-*' -print -quit)/Build/Products/Debug-iphoneos/mirrorsoul.app"`로 직접 설치한다. Xcode GUI에서 직접 Run 하는 것도 시도했으나 CocoaPods의 `[Hermes] Replace Hermes`/`[RNDeps] Replace React Native Dependencies` 스크립트가 CLI 빌드와 상태가 어긋나 실패하는 경우가 있어 **권장하지 않음** — CLI 빌드 + `ios-deploy` 조합이 가장 안정적이었다.
4. **`npx expo install --fix` 이후 Metro가 `Cannot find module '@expo/metro-config/build/transform-worker/supervising-transform-worker.js'`로 크래시** — `npm install`을 짧은 간격으로 두 번 연달아 실행하면 `node_modules` 트리(및 Metro 캐시)가 일시적으로 꼬일 수 있다. 해결: `rm -rf node_modules && npm install` 후 `npx expo start --clear`로 캐시까지 초기화.
5. **Android는 이 버그들과 무관** — `npx expo run:android -d`는 완전히 다른 코드 경로(adb)를 쓴다.
6. **(2026-07-30, 근본 원인 확정 — iOS Simulator 빌드가 구조적으로 불가능) `GoogleMLKit`(얼굴 인식, Step5 얼굴 스캔에 사용) 관련 Pod들이 Apple Silicon용 arm64 시뮬레이터 슬라이스를 아예 안 갖고 있다.**
   - 증상: `xcodebuild -showdestinations`가 `mirrorsoul` 스킴에 대해 구체적인 시뮬레이터를 하나도 안 보여주고 `Any iOS Simulator Device` 플레이스홀더만 반환 (`Unable to find a destination matching the provided destination specifier`). 반면 워크스페이스 내 다른 스킴(예: `ExpoModulesCore`)은 정상적으로 모든 시뮬레이터를 나열함 — 즉 앱 전체가 아니라 `mirrorsoul` 타겟 자체의 문제.
   - 원인: `Pods/Target Support Files/Pods-mirrorsoul/Pods-mirrorsoul.{debug,release}.xcconfig`에 `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64`가 있다 (MLKit 계열 podspec에서 상속됨). 이 Mac은 Apple Silicon이라 시뮬레이터 아키텍처가 arm64 하나뿐인데 그걸 통째로 제외하니 시뮬레이터용으로 빌드 가능한 아키텍처가 0개가 되어 destination 자체가 안 잡힌다. **이 제외 설정을 지우면 destination은 다시 잡히지만(테스트로 검증함), 그다음 링크 단계에서 확정적으로 실패한다**: `ld: building for 'iOS-simulator', but linking in object file (Pods/MLImage/Frameworks/MLImage.framework/MLImage[arm64][2](GMLImage.o)) built for 'iOS'` — 즉 MLKit 프레임워크의 arm64 오브젝트 파일이 진짜로 디바이스 전용이라 시뮬레이터 arm64로는 링크가 안 된다. `EXCLUDED_ARCHS` 설정은 stale한 게 아니라 **원래 의도된, 필요한 설정**이었다 (건드리지 말 것 — 실험 후 원상복구함).
   - x86_64(Rosetta) 시뮬레이터로 우회도 시도했으나, 이 Mac엔애초에 x86_64 iOS 시뮬레이터 런타임 자체가 설치되어 있지 않다(`xcrun simctl list runtimes`에 전부 arm64 런타임만 있음) — 우회 불가능.
   - **결론: 이 상태로는 `mirrorsoul` 앱을 iOS 시뮬레이터에 빌드할 방법이 없다.** 유일한 실제 옵션: (a) 항목 #3의 기존 절차대로 **실기기(ios-deploy)로만 검증**, 또는 (b) `GoogleMLKit`/`MLKitFaceDetection`/`MLKitCommon`/`MLKitVision`을 Apple Silicon 시뮬레이터 슬라이스를 제공하는 최신 버전으로 업그레이드(`pod update`, 별도 세션에서 신중히 검증 필요 — 다른 pod와의 호환성 깨질 위험 있음), 또는 (c) MLKit을 시뮬레이터 빌드에서만 조건부로 제외하는 Podfile 구성(복잡함, 얼굴 스캔 관련 코드는 시뮬레이터에서 테스트 불가하게 됨).
   - **부가로 발견/수정한 별개의 문제 (이건 진짜 고쳐짐)**: 이 MCP 빌드 도구가 `xcodebuild`를 실행하는 환경은 PATH에 Homebrew `node`가 없어서, `.xcode.env`의 `NODE_BINARY=$(command -v node)`가 빈 문자열로 풀려 `[Hermes] Replace Hermes` 스크립트가 `: command not found`로 실패했다. `mirror-soul/ios/.xcode.env.local`(git-ignored)에 `export NODE_BINARY=/opt/homebrew/bin/node`를 하드코딩해서 해결 — 이건 이 MCP 도구로 빌드할 때만 필요하고, `npx expo run:ios`/Xcode GUI는 정상 PATH를 쓰므로 원래도 문제없었다.

## tsc/lint 베이스라인

`main` 기준으로 이미 상당수의 pre-existing tsc 에러/lint 경고가 있다 (주로 `.svg` 모듈 타입 선언 누락, 오래된 컴포넌트들). **새 작업을 검증할 때는 절대 개수가 아니라 "내가 건드린 파일에서 새로 생긴 에러가 있는가"만 확인**할 것 (`npx tsc --noEmit 2>&1 | grep <내가 건드린 파일들>`).
