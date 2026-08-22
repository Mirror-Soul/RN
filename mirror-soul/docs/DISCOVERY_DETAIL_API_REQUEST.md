# 발견(홈) 화면 상대 프로필 상세 — 백엔드/AI 서버 요청 정리

작성일: 2026-08-14 (`fix/158-home-ui`)
**정정: 2026-08-17** — 아래 §1의 최초 버전은 "상세 조회 API가 없다"는 잘못된 전제로
쓰여 있었다. CodeRabbit 리뷰를 검증하는 과정에서 `mirror-soul-back` 소스를 다시 확인해보니
`HomeController`에 이미 추천 목록/상세/스와이프 API 세트가 구현돼 있었다(§1 최신 내용 참고).
새 엔드포인트를 만들어달라는 요청이 아니라 **기존 DTO에 필드를 추가해달라는 요청**으로
바뀌었다는 점에 유의할 것.

## 배경

발견 탭 카드(`DiscoveryMatchCard.tsx`)와 상세 모달(`PartnerProfileModal.tsx`)을 이번 세션에서 전면 개편했다.
지금은 두 화면 다 `SoulMatch` 목업 데이터로만 채워져 있는데, 화면을 설계하면서
`mirror-soul-back` 소스를 직접 확인해보니 아래 데이터는 **이미 DB에 존재**한다.
이 문서는 이걸 실제로 연동하기 위해 백엔드/AI 서버 엔지니어에게 무엇을 요청하면 되는지
정리한 것 — 프론트는 응답 모양만 맞으면 바로 갈아끼울 준비가 되어 있다(각 필드가
현재 화면 어디에 쓰이는지는 아래 표 참고).

## 1. 백엔드에 요청할 것: 기존 추천 상세 API에 필드 추가

### 이미 존재하는 것 (재조사 없이 그대로 쓸 것)
`HomeController`에 발견 탭에 필요한 API가 이미 세 개 다 구현돼 있다 — 새로 만들 필요 없음:

```
GET  /home/recommend                               → 추천 목록(페이지네이션, RecommendationSliceDTO)
GET  /home/recommendations/{target-user-uuid}       → 상세 조회 (RecommendationDetailDTO)
POST /home/recommendations/{target-user-uuid}/swipe → 스와이프(패스) 기록
```

`RecommendationDetailService.getDetail()`(`mirror-soul-back/.../service/RecommendationDetailService.java`)이
실제로 반환하는 `HomeResDTO.RecommendationDetailDTO`:

```java
record RecommendationDetailDTO(
    UUID userUuid, String name, Integer age, String profileImageUrl,
    Integer syncRate,              // Clone.syncRate — "트윈 싱크로율" 배지
    RegionDTO region,               // { sidoName, sigunguName }
    String selfIntroduction,        // User.selfIntroduction — "이 사람의 이야기" 자리
    String twinStatus,               // "AVAILABLE" | "IN_CALL"
    VoicePreviewDTO voicePreview     // { audioUrl(presigned), contentType, durationMs } — 실제 재생 가능한 URL, 이미 구현됨
)
```

`voicePreview.audioUrl`은 `FileService.createPresignedDownloadUrl()`로 만든 실제 S3 presigned URL이고
만료시간도 `awsS3Properties.getPresignedUrlExpirationMinutes()`로 이미 설정 가능하다 — "목소리 미리듣기"는
프론트가 UI만 완성하면 바로 실제 오디오를 재생할 수 있는 상태다(`PartnerProfileModal.tsx`의
"실제 목소리 미리듣기는 준비 중이에요" 문구는 이 사실을 몰랐을 때 넣은 것 — 연동 시 제거).

`GET /home/recommend`의 리스트 항목(`RecommendationDTO`)에는 `userUuid, name, age, profileImageUrl,
region, recommendationScore`만 있다 — 지금 `DiscoveryMatchCard.tsx`가 홈 카드에 표시하는
`cloneSummary`/`aiAnalysisTags`/`mbti` 미리보기는 상세 API에만 있는 필드라서, **카드 단계에서
보여주려면 목록 DTO에도 같은 필드를 추가해달라고 요청하거나, 카드에서는 이 필드들을 빼야 한다.**

### 이제 충족된 것 (백엔드 `d9ec3c1`, "8월 17일 회의록 내용 반영", 2026-08-20)

아래 표에서 요청했던 것 중 `personalityTags`/`mbti`/`mbtiAxisScores`는 이미 충족되어 FE 연동
완료됐다(`feat/discovery-real-data` 브랜치). 실제 필드명은 요청 당시 예상과 다른 부분이 있으니
연동 시 유의:

| 요청했던 것 | 실제 필드명 | 비고 |
|---|---|---|
| `personalityTags: string[]` | `hashtags: string[]` | 다른 이름으로 왔지만 소스는 동일 — `RecommendService.loadHashtagsByUserId()`가 여전히 `ClonePersonalityTag.content`에서 가져옴. 개념은 요청한 것과 같음. |
| `mbti` | `mbti` | 요청한 그대로 추가됨 |
| `mbtiAxisScores: { ie, ns, ft, pj }` | `mbtiIndicators: { ieScore, nsScore, ftScore, pjScore }` | 필드명이 요청과 다르게 왔지만 FE 타입에 그대로 반영함(`src/types/api/home.ts`의 `MbtiIndicators`) |
| `syncRate`/`selfIntroduction`/`voicePreview` | 동일 | 원래부터 있었음 |

**여전히 미충족**: §2("가치관 성향" 자연어 요약)는 AI 서버 파이프라인 신규 작업이 필요해서
그대로 열려있는 요청으로 남아있다 — FE가 자체적으로 연동할 수 있는 부분이 아니다.

### 접근 제어 — 갱신된 상태 (2026-08-22 재확인)
`RecommendationDetailService.getDetail()`은 대상 유저가 `status == ACTIVE`이고
`matchingEnabled == true`인지는 확인한다(비활성/매칭거부 유저 조회는 막혀 있음).
차단(block) 기능은 이후 커밋(`c4e06fb`)에서 추가되어 현재 추천 목록/상세 조회 양쪽에서
이미 검사된다 — 이 문서 최초 작성 시점의 "차단 기능 자체가 백엔드에 없다"는 서술은 stale하니
참고하지 말 것.

**여전히 남아있는 좁은 갭**: **요청자와 대상자 사이에 실제 추천 관계가 있었는지는 여전히
검증하지 않는다** — UUID만 알면 추천 목록에 뜬 적 없는 다른 활성 사용자의 상세 정보와 음성
URL도 그대로 조회 가능하다. 가장 최근 백엔드 커밋(`d9ec3c1`)도 이 파일(`getDetail`)을
건드렸지만(파라미터를 `(requesterUuid, targetUserUuid)` 2개로 바꾸는 등) 이 갭은 다루지
않았다 — "요청자에게 실제로 노출된 적 있는 대상인지" 검증 로직 추가를 여전히 요청할 것.

에러 코드는 이미 `RECOMMENDATION_TARGET_NOT_FOUND`/`SWIPE_TARGET_UNAVAILABLE` 둘 다
403이 아니라 404로 통일돼 있다 — 이건 "차단됨"과 "존재하지 않음"을 구분해서 노출하지 않는
의도적인(그리고 올바른) 설계로 보이니, 위 관계 검증을 추가할 때도 이 컨벤션(404로 통일)을
유지해달라고 하면 된다.

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

### 보존 정책 요청 (원본 답변을 AI 파이프라인에 넘길 때)
§2.1에서 제안하는 "축 평균 대신 원본 답변을 AI에 그대로 넘기자"는 방향은, 프론트/API 응답에
원본을 노출하지 않는 것과는 별개로 **AI 서버 내부에 원본 답변이 로그/캐시/재학습 데이터로
남을 위험**이 있다. AI 서버 엔지니어에게 아래를 명시해달라고 요청할 것:
- 요청 로그에 원본 답변 텍스트를 남길 경우 마스킹 여부
- 캐시/중간 저장소 보존 기간
- 이 데이터를 모델 재학습에 사용하지 않는다는 확인(또는 사용한다면 별도 동의 절차 필요 여부)
- 접근 가능한 인원/시스템 범위, 삭제 요청 시 절차

## 2.1 가치관 축 점수(-1~+1 평균) 산정 방식 재검토 (지난 회의 후속, 2026-08-14)

지난 회의에서 "축별 점수를 -1/+1로 산정하는 방식이 모호하다"는 의견이 나왔고,
백엔드에서 이 로직을 수정할 예정이라고 함. 코드(`UserValueAxisScore.addSample()`,
`V26__add_value_balance_game.sql` 시드 데이터)를 직접 확인해서 원인을 짚어봤다.

### 문제의 본질: "-1~+1"이 아니라 "무엇을 평균 내는가"

`UserValueAxisScore`는 같은 축(`ValueBalanceAxis`, 예: `LIFESTYLE`)에 속한 **모든 질문의
답을 단순 평균**한다. 그런데 `LIFESTYLE` 축 하나에 "아침형/저녁형", "집순이/밖순이",
"미니멀/맥시멀", "강아지파/고양이파"처럼 서로 무관한 하위 성향이 다 섞여 있다(시드 SQL
확인함). 그 결과:

- 아침형(-1)이면서 맥시멀리스트(+1)인 사람 → 평균 0
- 모든 문항에 정확히 "중간"으로 답한 사람 → 평균도 0

**전혀 다른 두 사람이 같은 숫자로 나온다.** 즉 스케일을 -1~+1에서 다른 범위로 바꾸는 걸로는
해결이 안 되고, "애초에 평균 낼 수 없는 것들을 억지로 평균 내고 있다"는 게 핵심 문제다.

### 대안 (실효성 순)

1. **(가장 실전적, AI 트윈 정확도에 직결) 축 평균 숫자를 AI 파이프라인에 넘기지 않고, 원본
   답변(질문+선택한 쪽)을 그대로 넘긴다.** `Clone.summary`/`ClonePersonalityTag` 생성 파이프라인이
   이미 있다면, 그 입력을 "축별 평균 점수"에서 "사용자가 실제로 고른 문항 목록"으로 바꾸는 것.
   LLM은 "아침형이면서 맥시멀리스트"를 평균 내지 않고도 그대로 이해해서 자연스러운 문장으로
   종합할 수 있다. 스키마/질문 재설계 없이 바로 적용 가능.
2. **(구조적 정답, 작업량 큼) 축을 진짜 같은 의미 단위로 재설계한다.** `LIFESTYLE` 하나를
   `CIRCADIAN`(아침/저녁형), `SOCIAL_ENERGY`(집순이/밖순이), `MATERIALISM`(미니멀/맥시멀) 등
   더 잘게 쪼개서, 축 안에서 평균 내는 게 다시 의미를 갖게 만든다. 질문 재태깅 + 축이
   8개→수십 개로 늘어나므로 "성향 밸런스 바" UI도 재설계 필요, 별도 프로젝트급.
3. **(보조 장치) 평균과 함께 분산(variance)도 저장.** 같은 축 안에서 답변이 서로 얼마나
   갈렸는지를 신뢰도 지표로 노출하면, 적어도 "이 축은 답변이 상충돼서 애매함"을 구분할 수는
   있다. 단, 근본 원인(1·2번)을 고치는 건 아니고 증상 완화용.

**결론: AI가 상대를 더 정확히 모방하는 게 목표라면 1번이 지금 가장 효율적.** 2번은 맞는
방향이지만 질문 콘텐츠 재작업까지 필요해서 우선순위를 나눠서 논의하는 게 좋다.

### 회의에서 말할 요지 (백엔드+AI 엔지니어 함께 있는 자리)

> "지금 축 점수가 -1/+1 평균으로 나오는데, 이게 애매한 이유는 스케일 문제가 아니라
> **한 축 안에 서로 무관한 질문들(아침형/저녁형 vs 미니멀/맥시멀 같은)을 같이 평균 내고
> 있어서**입니다. 그래서 완전히 다른 두 사람이 같은 점수로 나올 수 있어요.
>
> 이걸 고치는 방법은 두 가지가 있는데, 하나는 축 자체를 더 잘게 쪼개서 진짜 같은 성향끼리만
> 평균 내는 거고(백엔드+질문 콘텐츠 재작업, 큰 작업), 다른 하나는 **AI 서버가 클론 페르소나를
> 만들 때 이 축 평균 점수를 아예 안 쓰고, 사용자가 실제로 고른 질문/답변 원문을 그대로 입력으로
> 받아서 스스로 종합**하게 하는 겁니다.
>
> 저희 목표가 'AI 트윈이 실제 사람을 더 정확히 모방하는 것'이라면, 평균값이라는 손실 압축된
> 숫자보다 원본 답변을 AI에 그대로 주는 게 정보 손실이 없어서 더 정확한 페르소나가 나올 거라고
> 봅니다. 축 재설계(1번)는 방향은 맞지만 질문 콘텐츠까지 다시 손봐야 해서 규모가 크니, 이번엔
> AI 서버 입력을 원본 답변으로 바꾸는 쪽부터 먼저 가고, 축 재설계는 별도로 우선순위를
> 논의하면 어떨까요?"

## 3. 함께 처리하면 좋은 것: 통화 연결 (Meeting API)

상세 모달의 "통화하기" 버튼은 지금 `Alert.alert`로 끝난다. 이건 이미
`docs/MVP_WORK_LOG_AND_ROADMAP.md` §6.1/§6.2에 정리된 "Chat/Meeting/PushDevice API 연동"
항목과 같은 작업이다 — §1의 `RecommendationDetailDTO` 필드를 추가하는 김에 "통화 요청 보내기"
액션(Meeting API 연동)도 같이 설계하면 두 번 일하지 않아도 된다. (자세한 내용은 로드맵 문서 참고)

## 참고

- 이 문서에서 언급한 백엔드 도메인 클래스 위치: `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/domain/{Clone,ClonePersonalityTag,MbtiProfile,UserValueAxisScore,AiVoiceProfile}.java`
- 프론트 목업 데이터 모양: ~~`SoulMatch`/`MbtiAxisScores`/`ValueTendency`~~ → 이 문서 작성 이후 실연동 완료(`feat/discovery-real-data`), 해당 목업 인터페이스는 삭제됨. 실제 타입은 `mirror-soul/src/types/api/home.ts`의 `Recommendation`/`RecommendationDetailResult` 참고.
