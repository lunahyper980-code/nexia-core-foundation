import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';

interface GlobalLoaderContextType {
  /** Whether the loader should be VISIBLE (after delay logic) */
  isVisible: boolean;
  loadingMessage?: string;
  /** Start loading - loader will only show after DELAY_MS if still loading */
  startLoading: (message?: string) => void;
  /** Stop loading - respects minDuration if loader became visible */
  stopLoading: () => void;
  /** Legacy alias for startLoading */
  showLoader: (message?: string) => void;
  /** Legacy alias for stopLoading */
  hideLoader: () => void;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

// Smart loader timing constants
const DELAY_MS = 400;      // Wait this long before showing loader
const MIN_DURATION_MS = 300; // If loader appears, show for at least this long

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  
  // Track actual loading state (raw)
  const isLoadingRef = useRef(false);
  // Track when loader became visible
  const visibleSinceRef = useRef<number | null>(null);
  // Timers
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minDurationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (minDurationTimerRef.current) {
      clearTimeout(minDurationTimerRef.current);
      minDurationTimerRef.current = null;
    }
  }, []);

  const startLoading = useCallback((message?: string) => {
    isLoadingRef.current = true;
    setLoadingMessage(message);
    
    // If already visible, just update message
    if (isVisible) return;
    
    // Clear any existing delay timer
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    
    // Start delay timer - only show loader if still loading after DELAY_MS
    delayTimerRef.current = setTimeout(() => {
      if (isLoadingRef.current) {
        visibleSinceRef.current = Date.now();
        setIsVisible(true);
      }
      delayTimerRef.current = null;
    }, DELAY_MS);
  }, [isVisible]);

  const stopLoading = useCallback(() => {
    isLoadingRef.current = false;
    
    // Clear delay timer - if loader hasn't appeared yet, it won't
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    
    // If loader is not visible, nothing to do
    if (!isVisible) {
      setLoadingMessage(undefined);
      return;
    }
    
    // Loader is visible - ensure minimum duration
    const visibleFor = visibleSinceRef.current ? Date.now() - visibleSinceRef.current : 0;
    const remainingTime = Math.max(0, MIN_DURATION_MS - visibleFor);
    
    if (remainingTime > 0) {
      // Wait for remaining time before hiding
      minDurationTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setLoadingMessage(undefined);
        visibleSinceRef.current = null;
        minDurationTimerRef.current = null;
      }, remainingTime);
    } else {
      // Already met minimum duration, hide immediately
      setIsVisible(false);
      setLoadingMessage(undefined);
      visibleSinceRef.current = null;
    }
  }, [isVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Legacy aliases for backwards compatibility
  const showLoader = startLoading;
  const hideLoader = stopLoading;

  return (
    <GlobalLoaderContext.Provider 
      value={{ 
        isVisible, 
        loadingMessage, 
        startLoading, 
        stopLoading,
        showLoader,
        hideLoader
      }}
    >
      {children}
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider');
  }
  
  // Return with legacy 'isLoading' alias for backwards compatibility
  return {
    ...context,
    isLoading: context.isVisible,
  };
}
