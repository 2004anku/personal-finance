"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import GlobalLoader from "./GlobalLoader";

type GlobalLoaderContextType = {
  showLoader: () => void;
  hideLoader: () => void;
};

const GlobalLoaderContext = createContext<GlobalLoaderContextType | null>(null);

const MIN_LOADER_DURATION = 300;

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const requestCount = useRef(0);
  const shownAt = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLoader = useCallback(() => {
    requestCount.current += 1;

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (requestCount.current === 1) {
      shownAt.current = Date.now();
      setVisible(true);
    }
  }, []);

  const hideLoader = useCallback(() => {
    requestCount.current = Math.max(0, requestCount.current - 1);

    if (requestCount.current !== 0) return;

    const remaining = Math.max(
      0,
      MIN_LOADER_DURATION - (Date.now() - shownAt.current),
    );

    hideTimer.current = setTimeout(() => {
      if (requestCount.current === 0) {
        setVisible(false);
      }
      hideTimer.current = null;
    }, remaining);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  return (
    <GlobalLoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <GlobalLoader visible={visible} />
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);

  if (!context) {
    throw new Error("useGlobalLoader must be used inside GlobalLoaderProvider");
  }

  return context;
}
