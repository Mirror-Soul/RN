# 내 소개 API 구현 요청

작성일: 2026-09-22
대상: 백엔드 엔지니어

## 요청 배경

앱의 **프로필 > 내 소개 보기** 화면은 상대방의 추천 상세와 같은 프로필 정보를 보여야 합니다. 다만 현재의 `GET /home/recommendations/{target-user-uuid}`는 추천 노출 이력과 상대 사용자만 대상으로 하며, 본인 UUID를 전달하면 의도적으로 조회가 거절됩니다.

이 자기 자신 차단 및 추천 노출 검증 규칙은 유지해 주세요. 프론트에서는 해당 API를 본인 소개 조회에 사용하지 않습니다.

## 요청 API

```http
GET /my-page/introduction
Authorization: Bearer <access token>
```

- URL path/query에 UUID를 받지 않고, 인증된 현재 사용자 기준으로 조회합니다.
- 응답 래퍼는 기존과 같은 `ApiResponse<T>` (`isSuccess`, `code`, `message`, `result`, `error`)를 사용합니다.
- `result`의 필드명과 중첩 구조는 현재 `GET /home/recommendations/{target-user-uuid}`의 `RecommendationDetailDTO`와 정확히 동일하게 맞춰 주세요.

```json
{
  "userUuid": "uuid",
  "name": "소울",
  "age": 28,
  "profileImageUrl": "https://...",
  "syncRate": 74,
  "region": {
    "sidoName": "서울",
    "sigunguName": "강남구"
  },
  "job": "DESIGN",
  "jobCertificationSubmitted": true,
  "selfIntroduction": "안녕하세요.",
  "mbti": "INFJ",
  "mbtiAxisScores": {
    "ieScore": 72,
    "nsScore": 65,
    "ftScore": 70,
    "pjScore": 75
  },
  "personalityTags": ["차분한", "깊이 있는 대화"],
  "voicePreview": {
    "audioUrl": "https://...",
    "contentType": "audio/mpeg",
    "durationMs": 12000
  }
}
```

## null/빈 값 계약

- `name`, `age`, `profileImageUrl`, `syncRate`, `region`, `job`, `selfIntroduction`, `mbti`, `mbtiAxisScores`는 미완성 프로필을 고려해 `null`을 허용합니다.
- `personalityTags`는 분석 결과가 없으면 `null` 대신 빈 배열 `[]`로 내려 주세요.
- `voicePreview`는 소개용 음성 파일이 아직 없으면 `null`입니다. 존재할 때 `audioUrl`, `contentType`, `durationMs`는 추천 상세와 같은 의미와 단위를 사용해 주세요. URL이 presigned URL이면 프론트는 화면 재진입 시 새 응답을 조회합니다.
- `jobCertificationSubmitted`는 항상 boolean으로 내려 주세요.

## 범위 밖 정보

가치관 분석의 원본 답변, AI 내부 점수·추론 문구 등 비공개 분석 데이터는 이 API에 포함하지 않습니다. 화면에는 위의 표시용 `personalityTags`와 MBTI 축 점수만 필요합니다.

## 프론트 반영 상태

프론트는 이미 위 경로와 필드명으로 연동되어 있습니다. API 배포 전에는 화면에서 재시도 안내가 표시되며, 배포 후 별도 앱 API 변경 없이 실제 데이터를 렌더링합니다.
