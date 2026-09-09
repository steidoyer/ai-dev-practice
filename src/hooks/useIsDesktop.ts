import { useSyncExternalStore } from "react";

const getServerSnapshot = () => false;
const getSnapshot = () => matchMedia('(min-width: 48rem)').matches;
const subscribe = (cb: () => void) => { 
  const m = matchMedia('(min-width: 48rem)');
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb)
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}