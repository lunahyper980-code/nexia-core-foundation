import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalLoader } from '@/contexts/GlobalLoaderContext';

/**
 * Hook that manages the global loader during route transitions.
 * 
 * SMART BEHAVIOR:
 * - Does NOT show loader on every route change
 * - Only triggers loading state, letting GlobalLoaderContext handle visibility
 * - Fast navigations (< 400ms) will never show the loader
 */
export function useRouteLoader() {
  const location = useLocation();
  const { startLoading, stopLoading } = useGlobalLoader();
  const previousPath = useRef(location.pathname);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip first mount - no loader needed
    if (isFirstMount.current) {
      isFirstMount.current = false;
      previousPath.current = location.pathname;
      return;
    }

    // Only trigger on actual route changes
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      
      // Start loading (will only show after 400ms delay if still loading)
      startLoading();
      
      // For route transitions, we use requestIdleCallback or a microtask
      // to stop loading once the new route component has rendered
      // This simulates "content ready" in most cases
      
      // Use requestAnimationFrame to wait for render, then stop
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          stopLoading();
        });
      });
    }
  }, [location.pathname, startLoading, stopLoading]);
}
