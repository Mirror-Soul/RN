import React, { useContext, useId, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { NoticeCard } from './NoticeCard';
import { DeliveryContext, type ToastDelivery } from './ToastDelivery';

/** Put inside the full-screen overlay of an existing native Modal, never in a new Modal. */
export function ToastViewport({ root = false, active = true }: { root?: boolean; active?: boolean }) {
  const delivery = useContext(DeliveryContext);
  return delivery ? <RegisteredViewport delivery={delivery} root={root} active={active} /> : null;
}
function RegisteredViewport({ delivery, root, active }: { delivery: ToastDelivery; root: boolean; active: boolean }) {
  const id = useId();
  const { register, unregister, toast, dismiss, read } = delivery;
  const alive = useRef(false);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { contentContainerStyle } = useLayout();
  const [viewportHeight, setViewportHeight] = useState(height);
  useLayoutEffect(() => {
    if (root || !active) return;
    alive.current = true;
    register(id);
    return () => { alive.current = false; queueMicrotask(() => { if (!alive.current) unregister(id); }); };
  }, [active, id, register, root, unregister]);
  const visible = active && toast && (root ? toast.host === null : toast.host === id);
  const top = insets.top + 12;
  const maxHeight = Math.min(viewportHeight - top - insets.bottom - 12, Math.max(88, viewportHeight * 0.45));
  return <View testID={root ? 'toast-root-viewport' : 'toast-modal-viewport'} pointerEvents="box-none" onLayout={event => { if (event.nativeEvent.layout.height > 0) setViewportHeight(event.nativeEvent.layout.height); }} style={styles.viewport}>
    {visible && <View pointerEvents="box-none" style={[styles.position, { top, paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }]}>
      <View style={contentContainerStyle}><NoticeCard key={toast.id} message={toast.message} type={toast.type} maxHeight={maxHeight} onDismiss={dismiss} onRead={read} /></View>
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  viewport: { ...StyleSheet.absoluteFillObject, zIndex: 2000, elevation: 2000 },
  position: { position: 'absolute', left: 0, right: 0 },
});
