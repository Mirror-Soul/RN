import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, useWindowDimensions } from 'react-native';
import { ToastViewport } from './ToastViewport';
import { DeliveryContext, type ToastState } from './ToastDelivery';
import { noticeDuration, type NoticeType } from './noticePresentation';

export type ToastType = NoticeType;
interface ToastAPI { showToast: (message: string, type?: ToastType) => void }
const ToastContext = createContext<ToastAPI | null>(null);
let externalShowToast: ToastAPI['showToast'] | null = null;
export const showGlobalToast = (message: string, type: ToastType = 'error') => { externalShowToast?.(message, type); };
export function useToast(): ToastAPI {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast requires ToastProvider.');
  return context;
}

/** Latest notice only. Native modal viewports render it on their own native layer. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [reading, setReading] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const sequence = useRef(0);
  const hosts = useRef<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const { fontScale } = useWindowDimensions();
  const clearTimer = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = null; }, []);
  const dismiss = useCallback(() => { clearTimer(); setToast(null); }, [clearTimer]);
  const read = useCallback(() => { clearTimer(); setReading(true); }, [clearTimer]);
  const register = useCallback((id: string) => {
    hosts.current = [...hosts.current.filter(host => host !== id), id];
    setToast(current => current ? { ...current, host: id } : current);
  }, []);
  const unregister = useCallback((id: string) => {
    hosts.current = hosts.current.filter(host => host !== id);
    if (mounted.current) setToast(current => current?.host === id ? { ...current, host: hosts.current.at(-1) ?? null } : current);
  }, []);
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (!message.trim() || !mounted.current) return;
    clearTimer();
    setReading(false);
    setToast({ id: ++sequence.current, message: message.trim(), type, host: hosts.current.at(-1) ?? null });
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }, [clearTimer]);

  useEffect(() => {
    mounted.current = true;
    externalShowToast = showToast;
    let active = true;
    void AccessibilityInfo.isScreenReaderEnabled().then(value => { if (active) setScreenReader(value); }, () => {});
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => {
      active = false; mounted.current = false; clearTimer(); subscription.remove();
      if (externalShowToast === showToast) externalShowToast = null;
    };
  }, [clearTimer, showToast]);
  useEffect(() => {
    clearTimer();
    if (toast && !reading && !screenReader) {
      const id = toast.id;
      timer.current = setTimeout(() => setToast(current => current?.id === id ? null : current), noticeDuration(toast.message, toast.type, fontScale));
    }
    return clearTimer;
  }, [clearTimer, fontScale, reading, screenReader, toast]);

  const api = useMemo(() => ({ showToast }), [showToast]);
  const delivery = useMemo(() => ({ toast, register, unregister, dismiss, read }), [toast, register, unregister, dismiss, read]);
  return <ToastContext.Provider value={api}><DeliveryContext.Provider value={delivery}>
    {children}<ToastViewport root />
  </DeliveryContext.Provider></ToastContext.Provider>;
}
