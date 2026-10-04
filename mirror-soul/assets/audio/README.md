# 소리 테스트 안내 음성

`audio-check.mp3`는 앱에 포함하는 약 9초의 한국어 AI 합성 안내 음성이다. 실제 사람의 녹음이나 회원의 음성 샘플이 아니다. 앱에서 `AI 안내 음성`으로 표시한다.

문장:

> 안녕하세요. 제 목소리가 편안하게 들리나요? 소리 크기를 조절해서 내게 편한 음량을 찾아보세요.

## 생성 출처

- [Supertonic 3 공식 보존 모델](https://huggingface.co/supertone-oss-archive/supertonic-3), revision `aafc6e32416a594460b32413efc49d7fe4ce6d46`.
- 기본 제공 `F1` voice style, Korean `ko`, seed 17, denoising steps 16, speed 1.0.
- [공식 Python ONNX 예제](https://github.com/supertone-oss-archive/supertonic/tree/main/py)로 개발 시점에 한 번 생성했다. 모델·Python 실행 환경·합성 코드는 RN 앱 또는 AI 서버에 추가하지 않았다.
- 모델은 [OpenRAIL-M](https://huggingface.co/supertone-oss-archive/supertonic-3/blob/aafc6e32416a594460b32413efc49d7fe4ce6d46/LICENSE) 계약을 따른다. 출력에 대한 규정은 section 6, AI 생성 고지는 Attachment A(e)에 있다. 생성물에 실제 사람의 목소리라는 표시를 하지 않는다.

## 후처리 및 재생

- 원본 44.1 kHz 모노 PCM, 약 8.57초.
- 저역 70 Hz 정리, 약 -20 LUFS 음량 정규화, true peak 상한 -3 dBTP, 시작/끝 짧은 fade.
- 최종 파일: 모노 44.1 kHz MP3, 128 kbps, 약 140 kB.
- 고정 파일만 재생하며 서버 호출·통화 시간 차감·사용자 녹음은 없다.
- 실제 재생에는 사용자의 `opponentVoiceVolume` 설정을 적용한다.
