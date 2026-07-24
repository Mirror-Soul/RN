import * as FileSystem from 'expo-file-system/legacy';

const UPLOAD_TIMEOUT_MS = 60000;

/**
 * S3Service
 * Presigned URL을 사용하여 S3에 직접 파일을 업로드합니다. (SoC)
 *
 * fetch(fileUri) + blob() 방식은 Android에서 큰 비디오 파일을 메모리에
 * 통째로 올리다 실패하며 "Network request failed"로 나타나는 경우가 있어,
 * 파일을 스트리밍으로 직접 PUT하는 FileSystem 업로드를 사용합니다.
 *
 * createUploadTask + 수동 타임아웃을 쓰는 이유: uploadAsync는 기본 타임아웃이
 * 없어 네트워크 장애 시 요청이 끝없이 대기할 수 있고, 그러면 이 함수를 호출하는
 * useFaceScanUpload의 finally가 영영 실행되지 않아 finalizing 로딩 UI가 풀리지
 * 않는 문제가 생김. 타임아웃 시 cancelAsync()로 강제 종료해 항상 일정 시간 안에
 * 응답(성공/실패)이 나도록 보장한다.
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  fileUri: string,
  contentType: string
): Promise<void> => {
  const uploadTask = FileSystem.createUploadTask(presignedUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': contentType,
    },
  });

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    uploadTask.cancelAsync().catch(() => {});
  }, UPLOAD_TIMEOUT_MS);

  try {
    const result = await uploadTask.uploadAsync();

    if (timedOut || !result) {
      throw new Error('S3 업로드 시간이 초과되었습니다. 네트워크 상태를 확인해 주세요.');
    }

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`S3 업로드 실패: ${result.status} ${result.body}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};
