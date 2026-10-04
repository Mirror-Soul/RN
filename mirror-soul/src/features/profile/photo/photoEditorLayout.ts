import { PROFILE_PHOTO_ASPECT, type PhotoSize } from './photoGeometry';

export type PhotoPreviewMode = 'detail' | 'card' | 'avatar';

/** Size the photo from the measured space between the header and fixed actions. */
export function getPhotoEditorFrame(viewport: PhotoSize, topHeight: number, bottomHeight: number, mode: PhotoPreviewMode = 'detail'): PhotoSize {
  const aspect = mode === 'avatar' ? 1 : mode === 'card' ? 4 / 3 : PROFILE_PHOTO_ASPECT;
  const availableHeight = Math.max(0, viewport.height - topHeight - bottomHeight - 40);
  // On very short screens, preserve a usable photo and let the surrounding content scroll.
  const minimumHeight = mode === 'avatar' ? 96 : mode === 'card' ? 108 : 160;
  const maximumWidth = Math.max(32, Math.min(viewport.width - 32, mode === 'avatar' ? 160 : 440));
  const width = Math.min(maximumWidth, Math.max(minimumHeight, availableHeight) * aspect);
  return { width, height: width / aspect };
}
