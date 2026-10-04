import type { Face } from 'react-native-vision-camera-face-detector';
import { assessFace, validFrameDelta } from './captureQuality';
import { classifyDirection } from './faceDirection';
import { fitPreview } from './captureLayout';

const size = { width: 300, height: 400 };
const face = { bounds: { x: 90, y: 62, width: 120, height: 163 }, yawAngle: 0, pitchAngle: 0, rollAngle: 0 } as Face;
it('accepts a single centered face and gently turned sides, but never up/down or extreme angles', () => {
  expect(assessFace([face], size, 'front').matching).toBe(true);
  expect(assessFace([{ ...face, yawAngle: 25 }], size, 'left').matching).toBe(true);
  expect(assessFace([{ ...face, yawAngle: -25 }], size, 'right').matching).toBe(true);
  expect(classifyDirection(0, 30)).toBeNull();
  expect(classifyDirection(70, 0)).toBeNull();
  expect(classifyDirection(NaN, 0)).toBeNull();
  expect(assessFace([{ ...face, rollAngle: 30 }], size, 'front').matching).toBe(false);
});
it('blocks missing, multiple, clipped, very small and very close faces', () => {
  expect(assessFace([], size, 'front').matching).toBe(false);
  expect(assessFace([face, face], size, 'front').matching).toBe(false);
  for (const bounds of [
    { x: -10, y: 62, width: 120, height: 163 },
    { x: 200, y: 62, width: 120, height: 163 },
    { x: 140, y: 150, width: 20, height: 30 },
    { x: 25, y: 0, width: 250, height: 340 },
    { x: 90, y: 62, width: NaN, height: 163 },
  ]) expect(assessFace([{ ...face, bounds }], size, 'front').matching).toBe(false);
});
it('does not turn a delayed face frame into capture time', () => {
  expect(validFrameDelta(null, 1000)).toBe(0);
  expect(validFrameDelta(1000, 1200)).toBe(200);
  expect(validFrameDelta(1000, 2000)).toBe(0);
  expect(validFrameDelta(2000, 1000)).toBe(0);
});
it.each([[272, 180], [336, 400], [382, 580], [720, 940], [120, 180]])('fits a portrait preview inside %s×%s without stretching or overflow', (width, height) => {
  const fitted = fitPreview(width, height, 0.75);
  expect(fitted.width).toBeLessThanOrEqual(width);
  expect(fitted.height).toBeLessThanOrEqual(height);
  expect(fitted.width / fitted.height).toBeCloseTo(0.75);
  expect(fitted.width).toBeGreaterThan(0);
});
it('handles an unmeasured camera area', () => {
  expect(fitPreview(0, 0, 0.75)).toEqual({ width: 0, height: 0 });
  expect(fitPreview(300, 400, NaN)).toEqual({ width: 0, height: 0 });
});
