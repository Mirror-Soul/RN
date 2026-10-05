export { PROFILE_PHOTO_ASPECT } from './profilePhotoPresentation';
export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

export interface PhotoSize { width: number; height: number }
export interface PhotoTransform { zoom: number; x: number; y: number }
export interface CropRect { originX: number; originY: number; width: number; height: number }

export function getCoverScale(image: PhotoSize, frame: PhotoSize) {
  return Math.max(frame.width / image.width, frame.height / image.height);
}

export function constrainTransform(image: PhotoSize, frame: PhotoSize, value: PhotoTransform): PhotoTransform {
  const zoom = Math.max(1, Math.min(4, value.zoom));
  const scale = getCoverScale(image, frame) * zoom;
  const maxX = Math.max(0, (image.width * scale - frame.width) / 2);
  const maxY = Math.max(0, (image.height * scale - frame.height) / 2);
  return { zoom, x: Math.max(-maxX, Math.min(maxX, value.x)), y: Math.max(-maxY, Math.min(maxY, value.y)) };
}

/** 화면 중앙에서 이동한 이미지의 실제 픽셀 좌표. 빈 여백이 crop에 들어가지 않는다. */
export function getCropRect(image: PhotoSize, frame: PhotoSize, value: PhotoTransform): CropRect {
  const transform = constrainTransform(image, frame, value);
  const scale = getCoverScale(image, frame) * transform.zoom;
  const width = Math.max(1, Math.min(image.width, Math.round(frame.width / scale)));
  const height = Math.max(1, Math.min(image.height, Math.round(frame.height / scale)));
  return {
    originX: Math.max(0, Math.min(image.width - width, Math.round((image.width - width) / 2 - transform.x / scale))),
    originY: Math.max(0, Math.min(image.height - height, Math.round((image.height - height) / 2 - transform.y / scale))),
    width,
    height,
  };
}
