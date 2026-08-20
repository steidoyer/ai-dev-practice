import { useSyncExternalStore } from "react";

const getServerSnapshot = () => false;
const getSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const subscribe = (cb: () => void) => { 
  const m = matchMedia('(prefers-reduced-motion: reduce)');
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb)
}

export function useReducedMotionSafe() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}