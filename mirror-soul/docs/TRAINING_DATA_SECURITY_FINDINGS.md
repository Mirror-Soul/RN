# 학습 데이터 보안 실태 — 백엔드/AI 서버/인프라 조사 결과

작성일: 2026-08-18 (`fix/164-evolve-ui`, Growth 탭 UI 작업 중 "안전과 개인정보" 안내 문구를
검증하는 과정에서 발견)

## 배경

Growth 탭 하단에 "모든 학습 데이터는 End-to-End 암호화로 보호되며..."라는 안내 문구가 있었다.
`mirror-soul-back` 서비스 계층에 `encrypt`라는 단어 자체가 한 군데도 없어서 문구 검증 차
`mirror-soul-back`/`mirror-soul-AI`/`mirror-soul-infra` 세 저장소를 전수 조사했다.

**결론: 조사 범위 전체에서 검증 가능한 암호화/인증 조치를 찾지 못했다.** 이 문서는 그
근거와, 문구 수정과는 별개로 실제 인프라/서버 쪽에 남아있는 갭을 정리한 것이다.
문구 자체는 이미 완화 완료(`mirror-soul/src/components/home/grow/EvolveFooter.tsx`,
"학습 데이터는 오직 당신의 트윈을 정교화하는 데에만 사용됩니다"로 교체) — **이 문서는 그
다음 단계, 즉 실제 인프라/서버 보안 갭을 팀에 전달하기 위한 것**이다.

여기서 다루는 "학습 데이터"는 음성 녹음(목소리 정밀 학습), 얼굴 스캔(얼굴 데이터 업데이트),
인터뷰 답변, 가치관 밸런스 게임 답변 등 트윈 학습에 쓰이는 사용자 데이터 전반이다 — 생체
인식에 인접한 데이터라 다른 개인정보보다 민감도가 높다.

## 1. 저장 시 암호화 (Encryption at Rest)

| 대상 | 상태 | 근거 |
|---|---|---|
| S3 (음성/얼굴 데이터 저장 버킷) | ⚠️ 명시적 SSE 정책 없음 | `mirror-soul-infra/s3.tf` — `aws_s3_bucket_server_side_encryption_configuration` 리소스 자체가 없음, KMS 리소스도 0건. **다만 AWS는 2023년 1월부터 모든 S3 버킷에 SSE-S3를 계정 차원 기본값으로 자동 적용하므로, 신규 객체는 이 기본값으로 암호화됐을 가능성이 높다** — "미암호화"가 아니라 "KMS 등 강화된 암호화 정책은 없다"로 읽는 게 정확하다. 그 기본값 적용 이전에 올라간 기존 객체까지 소급 적용되는지는 별도 확인 필요 |
| RDS MySQL (메인 DB) | ❌ 미암호화 | `mirror-soul-infra/rds-mysql.tf:69-100` (`aws_db_instance.mysql`)에 `storage_encrypted` 필드 자체가 없음 → 기본값 `false`. RDS는 S3와 달리 AWS가 자동으로 켜주는 기본 암호화가 없어서, 이 항목은 위 S3와 달리 "정말로 미암호화"가 맞다 |
| RDS PostgreSQL (벡터 DB) | ✅ 암호화됨 | `mirror-soul-infra/rds-postgresql.tf:47` `storage_encrypted = true` — 유일하게 명시적으로 설정된 케이스 |
| AI 서버 로컬 파일 | ❌ 평문 저장 | 아래 §4 참고 |

메인 사용자 DB(MySQL)만 벡터 DB와 다르게 암호화 설정이 빠져 있다 — 의도적 제외라기보다는
단순 누락으로 보인다(벡터 DB는 최근에 추가되면서 암호화를 켰고, 메인 DB는 그 이전부터
있던 설정을 그대로 안 건드린 것으로 추정).

## 2. 전송 중 암호화 (Encryption in Transit)

- S3 presigned URL은 `https://` 스킴으로 발급되지만(`mirror-soul-back/.../service/FileService.java:159-165`
  `buildFileUrl()`), 버킷 정책에 `aws:SecureTransport` 강제 조건이 없다(`aws_s3_bucket_policy`
  리소스가 `mirror-soul-infra`에 아예 없음) — 즉 HTTP로 접근해도 막을 정책이 없다.
- `application.yaml:6`의 JDBC 접속 문자열(`jdbc:mysql://...`)에 `useSSL`/`requireSSL` 파라미터가
  없다 — DB 커넥션 암호화 여부가 MySQL 서버 쪽 기본 설정에만 의존한다.
- AI 서버가 ElevenLabs API를 호출할 때 `https://`를 쓰지만, 이건 서드파티 SDK가 처리하는
  구간이지 이 앱이 직접 구현한 전송 보안이 아니다.

## 3. 네트워크 접근 제어

- **RDS MySQL/PostgreSQL 둘 다 `publicly_accessible = true`이고, 보안그룹이 3306/5432 포트를
  `0.0.0.0/0`(전 인터넷)에 열어두고 있다.**
  - `mirror-soul-infra/rds-mysql.tf:91` (`publicly_accessible = true`) + `rds-mysql.tf:46-53`
    (보안그룹, 코드 주석에 **"전체 허용. !임시 개발용!"**이라고 직접 명시돼 있음)
  - `mirror-soul-infra/rds-postgresql.tf:59` (`publicly_accessible = true`) + `rds-postgresql.tf:17-23`
    (동일하게 5432 전체 허용)
- **AI 서버도 같은 패턴이다 — EC2가 퍼블릭 서브넷에서 고정 퍼블릭 IP로 직접 노출돼 있고,
  보안그룹이 앱 포트를 전 인터넷에 열어둔다.**
  - `mirror-soul-infra/ec2.tf`의 `aws_instance.ai_server` — `subnet_id = aws_subnet.public_a.id`
  - `mirror-soul-infra/eip.tf`의 `aws_eip_association.ai_server_eip_asspc` — Elastic IP가 직접
    연결돼 고정 퍼블릭 IP를 가짐
  - `mirror-soul-infra/security-group.tf`의 `sg_ai_server` — FastAPI 포트(8000)가 `0.0.0.0/0`에
    열려 있음(코드 주석: "굳이 안열어도 되지만 swagger나 그런거 사용 위해 열어둠")
  - ALB/API Gateway/인증 프록시 없이 EC2가 바로 노출되는 구조다 — §4의 "애플리케이션
    코드에 인증이 없다"는 사실과 합쳐지면, 실제로 외부에서 인증 없이 도달 가능하다는
    결론이 선다(코드만으로는 이 결론이 안 나오고, 이 네트워크 근거가 있어야 성립함).
- S3 버킷 CORS: `mirror-soul-infra/s3.tf:11-22` `allowed_origins = ["*"]` (주석: "운영 환경에서는
  프론트 도메인만 허용" 권고가 남아 있음 — 아직 반영 안 됨). 단 `s3.tf:25-31`의
  `aws_s3_bucket_public_access_block`은 4개 필드 모두 `true`로 정상 설정돼 있어 **버킷 자체의
  퍼블릭 접근은 막혀 있다** (S3는 이 부분만 안전).
- AI 서버 CORS: `mirror-soul-AI/main.py:13-19` `allow_origins=["*"]`.
- 참고로 TLS 종단(ALB/ACM 인증서) 설정은 `mirror-soul-infra` 어디에도 없다 —
  `security-group.tf:44-46`에 443 포트 인바운드 허용만 있고, 실제로 그 포트에서 TLS를
  종단하는 리소스(로드밸런서 리스너, ACM 인증서)는 확인 못 함. 포트가 열려있다고 TLS가
  실제로 적용된다는 뜻은 아니라서, 별도 확인이 필요하다.

## 4. AI 서버 — 인증 없음 + 평문 영구 저장

이 절의 결론은 두 근거를 합친 것이다: (1) 애플리케이션 코드 자체에 인증 로직이 없다는
것 — 아래에서 코드 레벨로 확정적으로 검증됨, (2) §3에서 확인했듯 이 서버가 인프라
레벨에서 실제로 인터넷에 직접 노출돼 있다는 것. (1)만으로는 "외부에서 접근 가능하다"고
단정할 수 없다(ALB/게이트웨이 같은 중간 계층이 앞단에서 인증을 대신 처리하고 있을 수도
있으므로) — 하지만 §3에서 그런 중간 계층이 전혀 없고 EC2가 퍼블릭 IP로 바로 노출된 걸
확인했기 때문에, 두 사실을 합치면 실제 외부 접근이 가능하다는 결론이 선다.

`mirror-soul-AI`의 `model_calling/routers/chat.py`, `model_training/routers/training.py` 전체를
확인했으나 **애플리케이션 레벨 인증/인가 로직이 전무하다** — `Depends`, JWT, Authorization
헤더 검증 0건. 요청에 실린 `user_id`/`target_user_id`를 검증 없이 그대로 신뢰한다.

- `main.py:24`의 `/assets` 정적 마운트도 인증 없이 공개돼 있다. §3의 네트워크 노출 근거와
  합쳐지면, URL만 알면 누구든 타인의 합성 음성 결과물에 접근 가능하다는 뜻이 된다.
- 합성 음성 결과물이 평문으로 영구 저장된다: `model_calling/assets/{user_id}/result_audio.m4a`
  (`model_calling/services.py:248-253,284`).
- 화자 유사도 검증용 참조 오디오도 평문 영구 저장: `model_calling/assets/clone_similarity/{user_uuid}/job-{job_id}-reference.mp3`
  (`model_calling/worker.py:320-325`).
- 화자 임베딩 계산 시 원본 오디오를 평문으로 임시 파일에 쓴다(`clone_similarity/speaker_embedding.py:53,158-168`,
  `with` 블록 종료 시 자동 삭제라 영구 보관은 아님). 이 기능 자체는 `.env.example:39` 기준
  기본값이 꺼져 있다(`CLONE_SIMILARITY_ENABLE_SPEAKER_EMBEDDING=false`) — 지금은 리스크가
  낮지만, 켜는 순간 바로 해당된다.
- persona.json도 평문 저장(`model_calling/routers/chat.py:174-179`).
- `requirements.txt`/`requirements-call.txt`/`requirements-voice-similarity.txt` 어디에도
  cryptography/pycryptodome/pynacl 같은 암호화 라이브러리가 없다.

음성 원본은 SQS job(`bucket`, `audioObjectKeys`)을 받아 AI 서버가 `boto3`로 S3에서 직접
`get_object()`하는 구조다(`model_calling/voice_training/worker.py:371-382`) — presigned URL이
아니라 IAM 자격증명 기반 직접 접근. 대부분 메모리(`bytes`)로만 다뤄지고 ElevenLabs API로
바로 전달되지만, 위에서 언급한 결과물/참조 오디오는 디스크에 평문으로 남는다.

## 5. 데이터 보존/삭제

- RAG 텍스트 벡터를 지우는 API는 있다: `DELETE /api/v1/training/users/{user_id}/rag-data`
  (`model_training/routers/training.py:87-95`, `services.py:199-206`).
- **원본 음성·합성 결과물·화자 인증 참조 오디오를 지우는 코드는 어디에도 없다**
  (`delete_object`/`os.remove`/`unlink` 전체 grep 결과 변환 중간 mp3 1건(`services.py:316`)뿐
  — 그것도 최종 산출물이 아니라 변환 과정에서 생기는 중간 파일). 즉 §4의 결과물들은
  사실상 영구 보관된다.
- `docs/MVP_WORK_LOG_AND_ROADMAP.md` §6.2에 이미 "회원탈퇴 시 30일 후 실제 삭제 이행 여부
  미확인"이 기록돼 있었다 — 이번 조사로 **AI 서버 쪽 산출물은 애초에 그 삭제 대상 후보에도
  없다**는 게 추가로 확인된 셈이다. 탈퇴 삭제 정책을 설계할 때 AI 서버 자산까지 포함해야
  한다.

## 6. 얼굴 스캔 데이터 — 처리 경로 자체가 불명확

`mirror-soul-back`의 `FileService.java:94-96` (`verifyFaceVideoAndBuildFileUrl`)를 보면
백엔드는 `face-videos/` 프리픽스로 얼굴 영상 업로드를 이미 받고 있다. 하지만
`mirror-soul-AI` 코드 전체에서 이 얼굴 영상/이미지를 실제로 다운로드·처리하는 로직을
찾지 못했다 — `avatar_image_url`(`model_calling/repository/clone_repository.py:28,99,125`)은
DB에서 URL 문자열을 읽어오는 필드일 뿐, 그 URL이 가리키는 파일을 실제로 받아서 학습에
쓰는 코드가 안 보인다.

이건 보안 문제라기보다 **기능 자체가 어느 단계까지 구현됐는지 불명확하다는 뜻**이다 —
얼굴 데이터가 실제로 AI 학습에 반영되고 있는지부터 재확인이 필요하다.

## 7. 우선순위별 권장 조치

1. **(즉시, 코드 변경 없이 인프라 설정만으로 가능)** RDS 보안그룹에서 `0.0.0.0/0` 제거,
   VPC 내부(백엔드 서버가 있는 서브넷)에서만 접근 가능하도록 제한. 지금 이 순간에도 인터넷
   어디서나 DB 포트로 접속을 시도할 수 있는 상태라 가장 시급하다.
2. **(즉시)** AI 서버 라우터에 최소한의 인증 추가 — 예: 백엔드가 발급하는 내부 서비스 토큰을
   검증하는 미들웨어 하나만 추가해도 "URL만 알면 접근 가능" 문제는 막힌다. `/assets` 정적
   마운트도 같이 막을 것.
3. S3/RDS MySQL 서버사이드 암호화 활성화 — 대부분 리소스 재생성 없이 켤 수 있는 설정이라
   난이도는 낮다(RDS는 예외적으로 재생성이 필요할 수 있어 다운타임 계획은 필요).
4. AI 서버 산출물(합성 음성, 참조 오디오, persona.json) 삭제 정책 수립 — 회원탈퇴 플로우와
   연동.
5. 얼굴 스캔 데이터가 실제로 어느 단계까지 구현됐는지 확인 (§6).
6. 위 조치들이 실제로 반영된 뒤, Growth 탭 안내 문구를 지금의 완화된 버전에서 좀 더 구체적인
   보호 내용으로 다시 강화할지 검토 — 이때도 법무 검토를 병행할 것.

## 참고

- 문구가 수정된 위치: `mirror-soul/src/components/home/grow/EvolveFooter.tsx`
- 이번 조사에서 확인한 백엔드 파일: `mirror-soul-back/src/main/resources/application.yaml`,
  `mirror-soul-back/src/main/java/com/mirrorsoul/mirrorsoul_api/service/FileService.java`
- 이번 조사에서 확인한 인프라 파일: `mirror-soul-infra/s3.tf`, `mirror-soul-infra/rds-mysql.tf`,
  `mirror-soul-infra/rds-postgresql.tf`, `mirror-soul-infra/security-group.tf`,
  `mirror-soul-infra/ec2.tf`, `mirror-soul-infra/eip.tf`,
  `mirror-soul-infra/backend.tf`(참고: 여기 있는 `encrypt = true`는 Terraform 상태 파일 자체의
  S3 백엔드 암호화라 사용자 데이터와는 무관)
- 이번 조사에서 확인한 AI 서버 파일: `mirror-soul-AI/main.py`,
  `mirror-soul-AI/model_calling/voice_training/worker.py`, `mirror-soul-AI/model_calling/services.py`,
  `mirror-soul-AI/model_calling/routers/chat.py`, `mirror-soul-AI/model_training/routers/training.py`,
  `mirror-soul-AI/model_training/services.py`, `mirror-soul-AI/clone_similarity/speaker_embedding.py`,
  `mirror-soul-AI/model_calling/repository/clone_repository.py`
- 관련 기존 문서: `docs/MVP_WORK_LOG_AND_ROADMAP.md` §6.2(백엔드 협업 필요 항목),
  §6.3(법무/콘텐츠 검토 필요 항목) — 이 문서의 발견 사항들은 같은 성격(법적/컴플라이언스
  P0)이라 그쪽 로드맵에 이어서 반영하는 걸 권장.
