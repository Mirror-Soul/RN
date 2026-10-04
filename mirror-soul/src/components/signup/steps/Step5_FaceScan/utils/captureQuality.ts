import type { Face } from 'react-native-vision-camera-face-detector';
import { classifyDirection } from './faceDirection';
import type { FaceDirection } from '../types/faceScan';

export interface PreviewSize { width: number; height: number }

/** autoMode의 미리보기 좌표. 어깨는 검출하지 않으며 윤곽 안내만 제공한다. */
export function assessFace(faces: Face[], size: PreviewSize, direction: FaceDirection) {
  if (faces.length !== 1) return { matching: false, message: faces.length ? '혼자 화면에 들어와 주세요.' : '얼굴이 보이도록 화면을 맞춰주세요.' };
  const face = faces[0];
  const { x, y, width, height } = face.bounds;
  if (![x, y, width, height, size.width, size.height, face.rollAngle].every(Number.isFinite) || size.width <= 0 || size.height <= 0 || width <= 0 || height <= 0) {
    return { matching: false, message: '얼굴 위치를 확인하고 있어요.' };
  }
  const ratio = width / size.width;
  if (ratio < 0.16 || (width * height) / (size.width * size.height) < 0.05) return { matching: false, message: '카메라에 조금 가까이 와주세요.' };
  if (ratio > 0.62 || height / size.height > 0.65) return { matching: false, message: '조금 떨어져 어깨까지 담아주세요.' };
  const cx = (x + width / 2) / size.width;
  const cy = (y + height / 2) / size.height;
  if (cx < 0.2 || cx > 0.8 || cy < 0.18 || cy > 0.64 || x < 0 || y < 0 || x + width > size.width || y + height > size.height) {
    return { matching: false, message: '얼굴을 화면 안쪽으로 맞춰주세요.' };
  }
  if (Math.abs(face.rollAngle) > 20 || classifyDirection(face.yawAngle, face.pitchAngle) !== direction) {
    return { matching: false, message: direction === 'front' ? '고개를 편하게 들고 정면을 봐주세요.' : '고개를 위아래로 들지 말고 살짝 돌려주세요.' };
  }
  return { matching: true, message: '좋아요. 이 구도를 유지해주세요.' };
}

// 검출이 끊기면 시간을 누적하지 않는다. 지연된 한 프레임으로 단계를 건너뛰지 않는다.
export function validFrameDelta(previous: number | null, now: number) {
  const delta = previous === null ? 0 : now - previous;
  return delta > 0 && delta <= 700 ? delta : 0;
}
