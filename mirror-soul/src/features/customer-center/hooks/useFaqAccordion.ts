import { useState, useCallback } from 'react';

/**
 * FAQ 아코디언 상태 관리 훅
 *
 * - Single Open 방식: 한 번에 하나의 항목만 열림
 * - 같은 항목 재탭 시 닫힘
 * - 전역 스토어 불필요: 화면 언마운트 시 상태 자동 GC
 */
export const useFaqAccordion = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const isOpen = useCallback(
    (id: string) => openId === id,
    [openId]
  );

  return { toggle, isOpen };
};
