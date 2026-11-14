'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

export const MD_QUERY = '(min-width: 768px)';
export const XL_QUERY = '(min-width: 1280px)';

// A media query read without a layout flash on later renders. The server cannot know the screen,
// so the first render is `false` (the narrow layout) and the browser value follows at once.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

type PanelSlot = {
  // The element inside the right drawer that a page's context is drawn into.
  node: HTMLElement | null;
  // Pages announce themselves so the shell knows whether the right drawer has anything to show.
  register: () => () => void;
};

const PanelSlotContext = createContext<PanelSlot | null>(null);

// Held by the shell: how many pages currently offer a right drawer, and where it is drawn.
export function usePanelSlotState() {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [count, setCount] = useState(0);
  const register = useCallback(() => {
    setCount((current) => current + 1);
    return () => setCount((current) => current - 1);
  }, []);
  return { node, setNode, hasContext: count > 0, slot: { node, register } satisfies PanelSlot };
}

export const PanelSlotProvider = PanelSlotContext.Provider;

// What a page offers for the right drawer, such as the parts that make up a render. On a wide
// screen inside the app shell it is drawn in the drawer. Anywhere else (a narrow screen, the
// marketing frame) it stays where it is written, in the page.
export function ShellPanel({ children }: { children: ReactNode }) {
  const slot = useContext(PanelSlotContext);
  const isWide = useMediaQuery(XL_QUERY);
  const register = slot?.register;
  useEffect(() => (register ? register() : undefined), [register]);
  if (slot?.node && isWide) return createPortal(children, slot.node);
  return <div className={slot ? 'xl:hidden' : undefined}>{children}</div>;
}
