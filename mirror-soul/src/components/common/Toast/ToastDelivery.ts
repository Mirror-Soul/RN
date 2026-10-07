import { createContext } from 'react';
import type { NoticeType } from './noticePresentation';

export interface ToastState { id: number; message: string; type: NoticeType; host: string | null }
export interface ToastDelivery {
  toast: ToastState | null;
  register: (id: string) => void;
  unregister: (id: string) => void;
  dismiss: () => void;
  read: () => void;
}
export const DeliveryContext = createContext<ToastDelivery | null>(null);
