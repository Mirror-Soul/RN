# MirrorSoul 로고와 로그인 화면

## 디자인 방향

사용자가 선택한 **08번 ‘반사된 물방울’**을 최종 방향으로 반영했다. 두 사람을 닮은 서로 다른 곡선이 중심의 열린 공간을 만들며, 나와 트윈의 연결을 표현한다. 후보의 비대칭 구도와 물방울 형태를 유지하고, 앱에 이미 사용하던 시안 `#00D3F3`와 퍼플 `#C27AFF` 단색으로 마감했다. 앱 아이콘 배경은 기존 다크 테마의 `#141414`이다.

기본 제공 이미지 대신 새 심볼을 로그인·가입 재개·앱 아이콘·시작 화면에 사용한다. 로그인 화면은 중앙 로고와 `MirrorSoul` 워드마크, ‘나를 닮은 트윈, 새로운 연결.’ 한 문장으로 정리했다. 입력창은 하나의 영역으로 묶고 불필요한 입력 아이콘을 덜었다. 비밀번호 찾기는 입력 영역 아래 오른쪽에 배치하며, 로그인은 대비가 높은 단색 주요 버튼, 회원가입은 보조 링크로 구분했다. 이전의 가입 재개·기존 이메일·비밀번호 찾기 로직과 iOS/Android 키보드 대응은 유지한다.

## 추가 후보와 로그인 화면 조정

10가지 방향을 별도로 생성했고, 사용자가 08번을 선택했다. [최초 후보 비교 이미지](design/logo-options/comparison.png)와 [원본·제작 프롬프트](design/logo-options/README.md)를 보존한다. 최종 벡터의 다크·라이트 및 32·48·76px 미리보기는 [여기](design/mirrorsoul-logo-08-final.png)에서 볼 수 있다.

로그인 화면에서는 로고와 워드마크 크기를 조금 줄이고, 주요 영역 간격과 이메일·비밀번호 입력 영역 높이를 맞췄다. 가입 재개 안내도 두 줄로 정리했다. 이번 소폭 조정의 관련 Jest 2개 묶음·9개 테스트와 수정 파일 ESLint가 통과했다. 실기기 육안 확인은 실행하지 않았다.

## 생성과 마감

`imagegen` 스킬과 내장 `image_gen` 도구로 콘셉트 이미지를 생성했다. CLI/API 키 방식은 사용하지 않았다. 선택한 생성 콘셉트는 `docs/design/logo-options/logo-08.png`에 보존했다. 최종 심볼은 이 후보의 외곽과 중심 간격을 따라 Bézier 곡선으로 작성했다. 생성 이미지의 배경·질감 대신 벡터 두 레이어와 앱의 기존 색상을 사용한다. 최초 M 형태 콘셉트는 `docs/design/mirrorsoul-logo-concept.png`에 기록으로만 남긴다.

형태·색상의 정본은 `assets/brand/mirrorsoul-mark.json`의 두 레이어다. RN의 `MirrorSoulMark.tsx`와 PNG/SVG 내보내기 스크립트가 이 파일을 함께 사용한다. UI에서는 벡터를 렌더링하므로 다양한 해상도에서 이미지 픽셀을 확대하지 않는다. SVG의 단색 Path만 사용하므로 여러 심볼 사이에 공유 ID 충돌이 생기지 않는다.

## 자산

| 경로 (`mirror-soul/` 기준) | 용도 |
| --- | --- |
| `assets/brand/mirrorsoul-mark.json` | 공통 기하·색상 |
| `assets/brand/mirrorsoul-mark.svg` | 편집·공유 가능한 벡터 심볼 |
| `assets/brand/mirrorsoul-mark.png` | 투명 1024px 심볼, 시작 화면 |
| `assets/brand/mirrorsoul-app-icon.png` | 투명도가 없는 1024px 정사각형 iOS·기본 아이콘 |
| `assets/brand/mirrorsoul-adaptive-foreground.png` | Android 전경·투명 안전 여백 |
| `assets/brand/mirrorsoul-adaptive-monochrome.png` | Android 테마 아이콘용 단색 심볼 |
| `assets/brand/mirrorsoul-favicon.png` | 파비콘 |
| `docs/design/logo-options/logo-08.png` | 선택한 08번 콘셉트 원본 |
| `docs/design/mirrorsoul-logo-08-final.png` | 최종 벡터의 배경·크기별 미리보기 |

기존 기본 이미지 파일은 삭제하거나 덮어쓰지 않고 `app.config.js` 참조만 새 자산으로 변경했다. Android는 기존 backgroundImage 참조를 제거하고 배경색과 새 전경·단색 레이어를 사용한다. iOS 아이콘에는 모서리 마스크나 투명 픽셀을 넣지 않는다. Android 전경은 108dp 레이어의 중앙 66dp 원 안에 심볼 전체가 들어가도록 내보낸다. [Expo 아이콘 가이드](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/), [Android adaptive icon 가이드](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)를 참고했다.

자산 재생성은 `sharp`를 사용할 수 있는 Node 환경에서 `node scripts/generate-brand-assets.cjs`로 가능하다. 이번 생성에는 Codex에 이미 제공된 Node 의존성 경로를 사용했고 앱에 새 라이브러리나 네이티브 의존성은 추가하지 않았다. 자산은 저장되어 있어 앱 실행·빌드에 이 스크립트나 sharp가 필요하지 않다.

## 반영·실기기 확인

로그인 화면의 변경은 기존 개발 앱에 JS를 다시 로드하면 보인다. 홈 화면 아이콘과 시작 화면은 native asset이므로 새 빌드가 필요하다. 이 작업에서는 기존 iOS/Android 폴더를 삭제하거나 prebuild를 실행하지 않았다.

```sh
# mirror-soul/에서 실행: 기존 네이티브 폴더가 재생성되므로 로컬 네이티브 수정은 먼저 보존
npx expo prebuild --clean

# 확인하려는 기기에 맞춰 하나씩 실행
npx expo run:ios -d
npx expo run:android -d
```

작은 화면·큰 글자에서는 로고 소개를 접고 입력값을 유지한다. 입력·주요 버튼 높이는 최소값만 지정해 글자가 커져도 늘어나며, 비밀번호 찾기와 회원가입은 최소 48pt 터치 영역을 유지한다. 기존 안전 영역과 필요 시 스크롤을 유지한다. 실기기에서 라이트·다크, 키보드, 글자 크기, iOS 홈 화면, Android 원형·사각형·테마 아이콘을 확인해야 한다. 개발 클라이언트의 splash 화면이 실제 배포 빌드의 launch screen과 다를 수 있으므로 최종 시작 화면은 preview/production 빌드에서 확인한다.

## 내장 이미지 생성 프롬프트

기존 로그인 개편 검증: 전체 Jest 75개 묶음·425개 테스트와 iOS·Android Hermes 번들 생성이 통과했다. 수정 파일 31개의 ESLint와 수정 TypeScript 파일의 진단에서 새 오류가 없었다.

08번 적용 후 관련 Jest 2개 묶음·9개 테스트와 브랜드 컴포넌트·내보내기 스크립트의 ESLint가 통과했다. TypeScript 전체 검사에는 기존 오류가 남아 있으나 수정 브랜드 컴포넌트의 진단은 없었다. 아이콘의 참조 파일 존재·해상도·투명도를 확인했다. iOS 아이콘은 1024px 불투명 이미지이며, Android 전경·단색 심볼의 모든 불투명 픽셀이 중앙 안전 원 안에 들어간다(최대 반경 282.8px 미만, 허용 반경 312.9px). 네이티브 빌드·실기기 육안 확인은 실행하지 않았다.

아래는 최초 M 형태의 생성 이력이며, 현재 08번 프롬프트는 `design/logo-options/manifest.json`에 있다.

### 최초 콘셉트

Use case: logo-brand. Create ONE final production-ready symbol for MirrorSoul, an AI digital-twin dating app where people get to know one another through their twins. This will be the same distinctive symbol on a mobile login screen and app launcher icon. A clean, original, minimalist flat geometric emblem: two softly rounded mirrored ribbon/arch forms meet across a narrow vertical negative-space seam, together suggesting an abstract M and a subtle connection between a person and their reflected twin. Balanced, inviting, confident contemporary identity, precise proportions, thick readable shapes at 24px, simple silhouette. Color palette ONLY a restrained smooth transition from electric cyan #00D3F3 on the left to soft vivid purple #C27AFF on the right; saturated colors readable on both off-white and very dark backgrounds. Genuinely transparent background, no solid backing or fake checkerboard. Square 1024x1024 output. Center one emblem; its total visible width and height each around 56% of the full canvas, with ample fully transparent margins for Android adaptive-icon safe area. No text or wordmark, no literal hearts, no faces, no infinity icon, no ornamental border, no app rounded-square tile, no shadows, no glow, no 3D, no texture, no watermarks, no presentation sheet. Render exceptionally crisp smooth edges. Deliver exactly the standalone transparent logo symbol.

### 콘셉트 개선

Use case: precise-object-edit. Refine this logo into an immaculate production-ready flat geometric mark. Preserve the basic two-mirrored rounded M silhouette and cyan-left/purple-right gradient, but REDRAW its contours with perfect smooth, symmetric vector-quality Bézier curves. Remove every ragged edge, speckle, stray pixel, colored noise, jagged central seam, white artifact, neon-magenta contamination and tiny protrusion. The two lobes must be separate clean shapes with a consistently narrow transparent central seam. Inner diagonal cutouts must be absolutely smooth and clean. Flat uniform gradient using ONLY #00D3F3 to #C27AFF, no lighting, texture or bevel. True transparent background and cutouts. One centered logo on a square 1024px canvas, visible emblem contained within the central 56% width and 56% height, generous entirely transparent padding on all four sides. No text, border or tile. Keep exact logo identity but polish geometry and edges meticulously for professional mobile branding.
