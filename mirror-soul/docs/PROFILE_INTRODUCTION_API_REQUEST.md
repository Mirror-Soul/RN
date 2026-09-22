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

## 후속 요청: 소개 수정 및 증빙 기반 변경

현재 온보딩의 `PUT /onboarding/personality`는 `ONBOARD_B` 상태에서만 동작하므로, 가입 완료 사용자의 자기소개 수정에 재사용하면 안 됩니다.

### 자기소개 수정

```http
PATCH /my-page/introduction
Authorization: Bearer <access token>
Content-Type: application/json

{
  "selfIntroduction": "수정할 소개 문구"
}
```

- 본인만 수정할 수 있어야 합니다.
- 성공 시 갱신된 소개 상세 DTO(또는 최소 `selfIntroduction`)를 반환해 프론트 캐시를 즉시 갱신할 수 있게 해 주세요.
- 빈 문자열·공백만 입력은 거절하고, 최대 글자 수도 서버에서 검증해 주세요.

### MBTI·직업 증빙 변경 요청

MBTI 검사 결과 이미지 또는 직업 증빙을 올리고 운영 확인 후 반영하려면, 단순 S3 업로드 키만으로는 상태를 표현할 수 없습니다. 별도 요청/심사 모델이 필요합니다.

```http
POST /my-page/verification-requests
Authorization: Bearer <access token>
Content-Type: application/json

{
  "type": "MBTI",
  "evidenceObjectKey": "verification-requests/...",
  "requestedMbti": "INFJ"
}
```

- `type`: `MBTI` 또는 `JOB`
- 응답 예시: `requestId`, `status` (`PENDING` / `APPROVED` / `REJECTED`), `submittedAt`, `reviewNote`
- MBTI는 **운영 승인 후에만** 실제 MBTI 및 축 점수를 바꾸도록 해 주세요. 클라이언트에서 이미지 업로드 직후 MBTI를 임의 변경하면 안 됩니다.
- 직업은 현재의 `jobCertificationSubmitted`가 “서류 제출 여부”인지 “심사 완료 여부”인지 구분되지 않습니다. 심사 기능을 도입한다면 별도 상태를 제공해, 앱이 `서류 제출 완료`와 `직업 인증 완료`를 정확히 구분할 수 있어야 합니다.

## 프론트 반영 상태

프론트는 이미 위 경로와 필드명으로 연동되어 있습니다. API 배포 전에는 화면에서 재시도 안내가 표시되며, 배포 후 별도 앱 API 변경 없이 실제 데이터를 렌더링합니다.
