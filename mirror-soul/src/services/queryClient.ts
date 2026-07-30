import { QueryClient } from '@tanstack/react-query';

/**
 * 앱 전역 QueryClient 싱글턴.
 * `app/_layout.tsx`(Provider 마운트)와 `apiClient.ts`(세션 만료 시 캐시 초기화)
 * 양쪽에서 참조해야 해서 순환참조를 피하려고 별도 파일로 뺐다.
 */
export const queryClient = new QueryClient();
