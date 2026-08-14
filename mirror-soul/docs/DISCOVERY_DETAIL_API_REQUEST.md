# 발견(홈) 화면 상대 프로필 상세 — 백엔드/AI 서버 요청 정리

작성일: 2026-08-14 (`fix/158-home-ui`)

## 배경

발견 탭 카드(`DiscoveryMatchCard.tsx`)와 상세 모달(`PartnerProfileModal.tsx`)을 이번 세션에서 전면 개편했다.
지금은 두 화면 다 `SoulMatch` 목업 데이터로만 채워져 있는데, 화면을 설계하면서
`mirror-soul-back` 소스를 직접 확인해보니 아래 데이터는 **이미 DB에 존재**한다.
이 문서는 이걸 실제로 연동하기 위해 백엔드/AI 서버 엔지니어에게 무엇을 요청하면 되는지
정리한 것 — 프론트는 응답 모양만 맞으면 바로 갈아끼울 준비가 되어 있다(각 필드가
현재 화면 어디에 쓰이는지는 아래 표 참고).

## 1. 백엔드에 요청할 것: 상세 조회 API 신규 개발

### 왜 필요한가
`MatchController`엔 `GET /twins`(목록) 하나만 있고, 카드를 탭했을 때 상대 한 명의
전체 정보를 내려주는 엔드포인트가 없다. 아래 필드들은 이미 여러 테이블에 흩어져 있지만
한 번에 조회해서 내려주는 API가 없는 상태다.

### 요청 스펙 제안

```
GET /matches/{userId}/detail   (경로/이름은 백엔드 컨벤션에 맞춰 조정 가능)
```

| 화면 표시 위치 | 필요 필드 | 소스 테이블/필드 |
|---|---|---|
| 카드 + 모달 상단 배지 "트윈 싱크로율 N%" | `syncRate` | `Clone.syncRate` |
| 카드 한줄 미리보기 + 모달 "AI 트윈 한줄소개" | `cloneSummary` | `Clone.summary` |
| 모달 "AI 페르소나 분석" 태그 | `personalityTags: string[]` | `ClonePersonalityTag` (clone_id 기준, `display_order` 순 정렬) |
| 카드 + 모달 MBTI 배지 | `mbti` | `MbtiProfile.mbti` |
| 모달 "성향 밸런스" 4축 바 | `mbtiAxisScores: { ie, ns, ft, pj }` | `MbtiProfile.ieScore/nsScore/ftScore/pjScore` |
| 모달 "가치관 성향" | 아래 §2 참고 | `UserValueAxisScore` (AI 가공 필요) |
| 모달 "목소리 미리듣기" | `introAudioUrl` (presigned) | `AiVoiceProfile.introAudioBucket/ObjectKey` — 기존 `FileController`의 `/files/presigned-url` 패턴 재사용 가능 |
| 공통 프로필 | 이름/나이/지역/직업/인증여부/사진 | 기존 `/twins` 목록 응답에 이미 있는 필드 재사용 |

### 프라이버시 주의사항
`ValueBalanceAnswer`(개별 질문에 대한 답변, 좌/우 선택)는 **원본 그대로 노출하지 말 것**을
요청할 것 — 개별 답변은 너무 세밀한 개인정보다. `UserValueAxisScore`(축별 집계 점수, -1~1)까지만,
그것도 §2처럼 AI가 사람이 읽을 수 있는 한 줄로 가공한 결과만 내려주는 게 맞다.

## 2. AI 서버에 요청할 것: 가치관 축 점수 → 자연어 요약

### 왜 필요한가
`UserValueAxisScore`는 축(`LOVE`/`LIFESTYLE`/`COMM`/`DECISION`/`SOCIAL`/`PRIORITY`/`TONE`/`TASTE`)별로
숫자 점수(-1~1)만 갖고 있다. 화면엔 "라이프스타일: 즉흥적으로 밖에 나가야 힘이 나요" 같은
자연어 한 줄이 필요한데, 이건 백엔드가 아니라 LLM 가공이 필요한 영역이다.
`Clone.summary`/`ClonePersonalityTag`도 이미 AI가 생성하는 값으로 보이니, 같은 파이프라인에
단계를 하나 추가하는 방향을 제안한다.

### 요청 스펙 제안
- 입력: 사용자의 `UserValueAxisScore` 8개(축, 점수, 표본 수) + 필요하면 최근 `ValueBalanceAnswer`의
  `leftLabel`/`rightLabel` 원문(가장 특징적인 2~3개 축만 선별해도 됨 — 8개 다 보여줄 필요는 없음)
- 출력: `{ axisLabel: string, description: string }[]` (2~4개 정도, 표본 수가 너무 적은 축은 제외)
- 예시 출력: `{ axisLabel: "라이프스타일", description: "집에서 여유롭게 쉬는 걸 좋아해요" }`
- 이미 `mirror-soul-AI`에 유사한 생성 파이프라인이 있다면(클론 성격 태그 생성용) 그걸 재사용하는 게
  제일 빠를 것 같다 — 신규 모델 파이프라인을 새로 만들 필요는 없어 보인다.
- 캐싱 권장: 사용자가 가치관 게임에 새로 답할 때마다 재생성할 필요는 없고, 답변이 N개 이상
  추가되거나 하루 1회 배치로 갱신하는 정도면 충분해 보인다(실시간성이 중요한 데이터가 아님).

## 3. 함께 처리하면 좋은 것: 통화 연결 (Meeting API)

상세 모달의 "통화하기" 버튼은 지금 `Alert.alert`로 끝난다. 이건 이미
`docs/MVP_WORK_LOG_AND_ROADMAP.md` §6.1/§6.2에 정리된 "Chat/Meeting/PushDevice API 연동"
항목과 같은 작업이다 — 상세 조회 API를 새로 설계하는 김에 "통화 요청 보내기" 액션도
같이 설계하면 두 번 일하지 않아도 된다. (자세한 내용은 로드맵 문서 참고)

## 참고

- 이 문서에서 언급한 백엔드 도메인 클래스 위치: `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/domain/{Clone,ClonePersonalityTag,MbtiProfile,UserValueAxisScore,AiVoiceProfile}.java`
- 프론트 목업 데이터 모양(그대로 갈아끼우면 되는 타입): `mirror-soul/src/components/home/main/Discovery/DiscoveryMatchCard.tsx`의 `SoulMatch`/`MbtiAxisScores`/`ValueTendency` 인터페이스
