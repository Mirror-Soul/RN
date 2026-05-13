/**
 * S3Service
 * Presigned URL을 사용하여 S3에 직접 파일을 업로드합니다. (SoC)
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  fileUri: string,
  contentType: string
): Promise<void> => {
  try {
    // 1. React Native에서 파일을 읽어 blob으로 변환
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`파일 읽기 실패: ${response.status}`);
    }
    const blob = await response.blob();

    // 2. S3에 PUT 요청 (타임아웃 30초 설정)
    const controller = new AbortController();
    // 추후 업로드 시간이 부족할 경우 아래 밀리초(ms) 값을 수정하세요.
    const timeoutId = setTimeout(() => controller.abort(), 30000); 

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': contentType,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`S3 업로드 실패: ${uploadResponse.status} ${errorText}`);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('업로드 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
    }
    throw error;
  }
};
