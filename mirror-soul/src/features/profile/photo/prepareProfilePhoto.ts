import { requireOptionalNativeModule } from 'expo';
import type { ImageManipulatorContext, ImageRef } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { MAX_PROFILE_PHOTO_BYTES, type CropRect } from './photoGeometry';

export interface PreparedProfilePhoto { uri: string; width: number; height: number; size: number }

export class PhotoPreparationError extends Error {}

export function getPhotoPreparationErrorMessage(error: unknown, fallback: string) {
  return error instanceof PhotoPreparationError ? error.message : fallback;
}

/** 구버전 개발 빌드에서 모듈 import 자체가 실패해도 가입 화면은 계속 사용할 수 있게 한다. */
async function getImageManipulator() {
  const native = requireOptionalNativeModule<{ manipulate?: unknown }>('ExpoImageManipulator');
  if (typeof native?.manipulate !== 'function') {
    throw new PhotoPreparationError('사진 편집 기능을 사용할 수 없어요. 앱을 업데이트한 뒤 다시 시도해 주세요.');
  }
  // 네이티브 모듈 확인 전에 import하면 패키지 내부 Context/ImageRef 접근부터 실패할 수 있다.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- 네이티브 모듈 확인 후에만 패키지를 읽어야 한다.
  const api: typeof import('expo-image-manipulator') = require('expo-image-manipulator');
  if (typeof api.ImageManipulator?.manipulate !== 'function' || !api.SaveFormat?.JPEG) {
    throw new PhotoPreparationError('사진 편집 기능을 사용할 수 없어요. 앱을 업데이트한 뒤 다시 시도해 주세요.');
  }
  return api;
}

export async function assertPhotoEditorAvailable() {
  await getImageManipulator();
}

/** 매번 방향을 정리한 원본에서 회전해 연속 JPEG 재압축을 피한다. */
export async function rotateSelectedPhoto(uri: string, degrees: number) {
  const { ImageManipulator, SaveFormat } = await getImageManipulator();
  const context = ImageManipulator.manipulate(uri);
  let image: ImageRef | undefined;
  try {
    context.rotate(degrees);
    image = await context.renderAsync();
    assertImageSize(image);
    const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
    assertImageSize(result);
    if (!result.uri) throw new PhotoPreparationError('사진을 회전하지 못했어요. 다시 시도해 주세요.');
    return result;
  } finally {
    image?.release();
    context.release();
  }
}

function assertImageSize(image: { width: number; height: number } | undefined) {
  if (!image || !Number.isFinite(image.width) || !Number.isFinite(image.height) || image.width <= 0 || image.height <= 0) {
    throw new PhotoPreparationError('사진을 읽을 수 없어요. 다른 사진을 선택해 주세요.');
  }
}

/** 디코더가 읽은 방향/크기로 좌표계를 통일한다. EXIF 회전과 HEIC도 이 단계에서 정리한다. */
export async function normalizeSelectedPhoto(uri: string) {
  const { ImageManipulator, SaveFormat } = await getImageManipulator();
  let context: ImageManipulatorContext | undefined;
  let decoded: ImageRef | undefined;
  let normalized: ImageRef | undefined;
  try {
    context = ImageManipulator.manipulate(uri);
    decoded = await context.renderAsync();
    assertImageSize(decoded);
    const factor = Math.min(1, 2048 / Math.max(decoded.width, decoded.height));
    context.resize({ width: Math.max(1, Math.round(decoded.width * factor)), height: Math.max(1, Math.round(decoded.height * factor)) });
    normalized = await context.renderAsync();
    assertImageSize(normalized);
    const result = await normalized.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
    assertImageSize(result);
    if (!result.uri) throw new PhotoPreparationError('사진을 읽을 수 없어요. 다른 사진을 선택해 주세요.');
    return result;
  } finally {
    normalized?.release();
    if (decoded !== normalized) decoded?.release();
    context?.release();
  }
}

/** 방향을 정리하고 실제 JPEG를 만든다. 픽커 MIME/확장자를 JPEG로 바꾸는 방식은 쓰지 않는다. */
export async function prepareProfilePhoto(uri: string, crop: CropRect): Promise<PreparedProfilePhoto> {
  const { ImageManipulator, SaveFormat } = await getImageManipulator();
  const context = ImageManipulator.manipulate(uri);
  let image: ImageRef | undefined;
  try {
    context.crop(crop).resize({ width: Math.min(1280, crop.width) });
    image = await context.renderAsync();
    assertImageSize(image);
    for (const compress of [0.85, 0.65, 0.45]) {
      const result = await image.saveAsync({ format: SaveFormat.JPEG, compress });
      assertImageSize(result);
      if (!result.uri) throw new PhotoPreparationError('사진을 읽을 수 없어요. 다른 사진을 선택해 주세요.');
      const info = await FileSystem.getInfoAsync(result.uri);
      if (info.exists && !info.isDirectory && info.size > 0 && info.size <= MAX_PROFILE_PHOTO_BYTES) {
        return { uri: result.uri, width: result.width, height: result.height, size: info.size };
      }
      await FileSystem.deleteAsync(result.uri, { idempotent: true });
    }
    throw new PhotoPreparationError('사진 용량을 줄이지 못했어요. 다른 사진을 선택해 주세요.');
  } finally {
    image?.release();
    context.release();
  }
}

export async function removePreparedPhoto(photo: PreparedProfilePhoto | null) {
  if (photo) await FileSystem.deleteAsync(photo.uri, { idempotent: true }).catch(() => {});
}
