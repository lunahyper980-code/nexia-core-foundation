import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalLoader } from '@/contexts/GlobalLoaderContext';

/**
 * Hook that shows the global loader during route transitions.
 * Automatically shows loader when route changes and hides after a brief delay.
 */
export function useRouteLoader() {
  const location = useLocation();
  const { showLoader, hideLoader } = useGlobalLoader();
  const previousPath = useRef(location.pathname);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Only trigger on actual route changes (not on first mount)
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      
      // Show loader
      showLoader();
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide loader after a short delay (simulates route transition)
      // In production, this would be tied to actual data loading completion
      timeoutRef.current = setTimeout(() => {
        hideLoader();
      }, 400);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, showLoader, hideLoader]);
}
