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
    if (__DEV__) {
      // 개발 환경: 상세한 디버깅을 위해 모든 인자 출력
      console.error(`[ERROR] ${message}`, ...args);
    } else {
      // 프로덕션 환경: 민감 정보 유출 방지를 위해 메시지만 출력
      // 상세 데이터(args)는 로그 시스템(예: Sentry)으로만 전송하는 것을 권장합니다.
      console.error(`[ERROR] ${message}`);
      
      // 에러 객체가 포함되어 있다면 최소한의 에러 메시지는 출력
      const errorObj = args.find(arg => arg instanceof Error);
      if (errorObj) {
        console.error(`-> Error Message: ${errorObj.message}`);
      }

      /**
       * TODO: 외부 에러 트래킹 서비스 연동 예시
       * if (Sentry) {
       *   Sentry.captureException(errorObj || message, { extra: { details: args } });
       * }
       */
    }
  },
};
