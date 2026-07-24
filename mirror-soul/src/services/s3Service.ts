import * as FileSystem from 'expo-file-system/legacy';

/**
 * S3Service
 * Presigned URL을 사용하여 S3에 직접 파일을 업로드합니다. (SoC)
 *
 * fetch(fileUri) + blob() 방식은 Android에서 큰 비디오 파일을 메모리에
 * 통째로 올리다 실패하며 "Network request failed"로 나타나는 경우가 있어,
 * 파일을 스트리밍으로 직접 PUT하는 FileSystem.uploadAsync를 사용합니다.
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  fileUri: string,
  contentType: string
): Promise<void> => {
  const result = await FileSystem.uploadAsync(presignedUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`S3 업로드 실패: ${result.status} ${result.body}`);
  }
};
