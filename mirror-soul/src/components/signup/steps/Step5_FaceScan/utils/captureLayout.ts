/** 카메라의 실제 출력 비율을 유지하며 남은 공간에 맞춘다. */
export function fitPreview(width: number, height: number, ratio: number) {
  if (![width, height, ratio].every(Number.isFinite) || width <= 0 || height <= 0 || ratio <= 0) return { width: 0, height: 0 };
  const fittedWidth = Math.min(width, height * ratio);
  return { width: fittedWidth, height: fittedWidth / ratio };
}
