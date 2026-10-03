import { constrainTransform, getCropRect } from './photoGeometry';

const frame = { width: 320, height: 400 };
describe('profile photo crop coordinates', () => {
  it('crops a landscape original to centered 4:5 without stretching', () => {
    expect(getCropRect({ width: 4000, height: 3000 }, frame, { zoom: 1, x: 0, y: 0 }))
      .toEqual({ originX: 800, originY: 0, width: 2400, height: 3000 });
  });
  it.each([{ width: 4000, height: 1000 }, { width: 1000, height: 4000 }])('constrains drag so $width × $height cannot expose blank pixels', image => {
    const value = constrainTransform(image, frame, { zoom: 2, x: 99999, y: -99999 });
    const crop = getCropRect(image, frame, value);
    expect(crop.originX).toBeGreaterThanOrEqual(0);
    expect(crop.originY).toBeGreaterThanOrEqual(0);
    expect(crop.originX + crop.width).toBeLessThanOrEqual(image.width);
    expect(crop.originY + crop.height).toBeLessThanOrEqual(image.height);
    expect(crop.width / crop.height).toBeCloseTo(0.8, 2);
  });
  it('halves the crop dimensions at 2x zoom', () => {
    expect(getCropRect({ width: 4000, height: 3000 }, frame, { zoom: 2, x: 0, y: 0 }))
      .toEqual({ originX: 1400, originY: 750, width: 1200, height: 1500 });
  });
});
