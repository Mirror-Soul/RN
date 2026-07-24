import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { DropdownAnchor } from './SelectDropdownModal';

/**
 * 토글 버튼의 화면상 위치를 측정해 그 아래에 드롭다운을 앵커링하기 위한 공통 훅.
 * 지역/직업 등 여러 드롭다운 트리거에서 재사용합니다 (DRY).
 */
export function useDropdownAnchor() {
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<DropdownAnchor | null>(null);

  const measureAndOpen = useCallback((onMeasured: () => void) => {
    requestAnimationFrame(() => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        onMeasured();
      });
    });
  }, []);

  return { triggerRef, anchor, measureAndOpen };
}
