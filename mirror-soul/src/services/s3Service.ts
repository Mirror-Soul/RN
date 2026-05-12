/**
 * S3Service
 * Presigned URL을 사용하여 S3에 직접 파일을 업로드합니다. (SoC)
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  fileUri: string,
  contentType: string
): Promise<void> => {
  // React Native에서 파일을 읽어 blob으로 변환
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // S3에 PUT 요청 (fetch 사용 권장 - Axios 대비 헤더 충돌 적음)
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`S3 upload failed: ${uploadResponse.status} ${errorText}`);
  }
};
