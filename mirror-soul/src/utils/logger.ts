/**
 * 중앙 집중식 로깅 유틸리티
 * 프로덕션 환경에서는 로그 출력을 제한하여 보안 및 성능을 최적화합니다.
 */

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // 에러 로그는 프로덕션에서도 필요한 경우가 많으므로 최소한의 정보만 출력하거나 
    // 나중에 Sentry 등 외부 에러 트래킹 서비스와 연동하기에 좋습니다.
    console.error(`[ERROR] ${message}`, ...args);
  },
};
