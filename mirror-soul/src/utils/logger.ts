/**
 * 중앙 집중식 로깅 유틸리티
 * 프로덕션 환경에서는 로그 출력을 제한하여 보안 및 성능을 최적화합니다.
 */
import * as Sentry from '@sentry/react-native';

const SENSITIVE_KEYS = ['answer', 'password', 'token', 'refreshtoken', 'accesstoken'];

const maskSensitiveData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(maskSensitiveData);

  const masked = { ...data };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      masked[key] = '*** MASKED ***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  return masked;
};

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, ...maskSensitiveData(args));
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.info(`[INFO] ${message}`, ...maskSensitiveData(args));
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...maskSensitiveData(args));
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (__DEV__) {
      // 개발 환경: 상세한 디버깅을 위해 모든 인자 출력
      console.error(`[ERROR] ${message}`, ...maskSensitiveData(args));
    } else {
      // 프로덕션 환경: 민감 정보 유출 방지를 위해 메시지만 출력
      // 상세 데이터(args)는 로그 시스템(예: Sentry)으로만 전송하는 것을 권장합니다.
      console.error(`[ERROR] ${message}`);
      
      // 에러 객체가 포함되어 있다면 최소한의 에러 메시지는 출력
      const errorObj = args.find(arg => arg instanceof Error);
      if (errorObj) {
        console.error(`-> Error Message: ${errorObj.message}`);
      }

      // Sentry로 전송 (민감 정보는 마스킹된 args만 extra로 첨부)
      if (errorObj) {
        Sentry.captureException(errorObj, { extra: { message, details: maskSensitiveData(args) } });
      } else {
        Sentry.captureMessage(message, { level: 'error', extra: { details: maskSensitiveData(args) } });
      }
    }
  },
};
