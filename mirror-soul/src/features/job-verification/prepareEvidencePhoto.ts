import { requireOptionalNativeModule } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';

export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
export interface EvidencePhoto { id: string; uri: string; size: number; width: number; height: number; previewFailed?: boolean }

/** 실제 JPEG로 변환하며 서류 가장자리를 자르지 않는다. 원본은 삭제하지 않는다. */
export async function prepareEvidencePhoto(uri: string): Promise<EvidencePhoto> {
  const native = requireOptionalNativeModule<{ manipulate?: unknown }>('ExpoImageManipulator');
  if (typeof native?.manipulate !== 'function') throw new Error('사진을 준비하는 기능이 필요해요. 앱을 업데이트한 뒤 다시 시도해 주세요.');
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- 구버전 네이티브 빌드를 먼저 확인한다.
  const { ImageManipulator, SaveFormat }: typeof import('expo-image-manipulator') = require('expo-image-manipulator');
  const context = ImageManipulator.manipulate(uri);
  let image: import('expo-image-manipulator').ImageRef | undefined;
  const generated: string[] = [];
  try {
    image = await context.renderAsync();
    if (!Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width <= 0 || image.height <= 0) throw new Error('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.');
    if (Math.max(image.width, image.height) > 4096) {
      const factor = 4096 / Math.max(image.width, image.height);
      context.resize({ width: Math.max(1, Math.round(image.width * factor)), height: Math.max(1, Math.round(image.height * factor)) });
      image.release();
      image = undefined;
      image = await context.renderAsync();
    }
    for (const compress of [0.95, 0.85, 0.75]) {
      const result = await image.saveAsync({ format: SaveFormat.JPEG, compress });
      if (!result.uri) throw new Error('사진을 준비하지 못했어요. 다른 사진을 선택해 주세요.');
      generated.push(result.uri);
      const info = await FileSystem.getInfoAsync(result.uri);
      if (info.exists && !info.isDirectory && info.size > 0 && info.size <= MAX_EVIDENCE_BYTES) {
        for (let i = generated.length - 1; i >= 0; i--) if (generated[i] === result.uri) generated.splice(i, 1);
        return { id: result.uri, uri: result.uri, size: info.size, width: result.width, height: result.height };
      }
    }
    throw new Error('사진 용량을 줄이지 못했어요. 5MB 이하의 선명한 사진을 선택해 주세요.');
  } finally {
    image?.release(); context.release();
    await Promise.all(generated.map(file => FileSystem.deleteAsync(file, { idempotent: true }).catch(() => {})));
  }
}
export const deleteEvidencePhoto = (photo: EvidencePhoto) => FileSystem.deleteAsync(photo.uri, { idempotent: true }).catch(() => {});
