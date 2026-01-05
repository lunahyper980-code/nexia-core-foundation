import { useCallback, useRef } from 'react';
import { useGlobalLoader } from '@/contexts/GlobalLoaderContext';

/**
 * Hook for wrapping async operations with smart loader.
 * 
 * Usage:
 * ```tsx
 * const { withLoader } = useSmartLoader();
 * 
 * const handleGenerate = async () => {
 *   await withLoader(async () => {
 *     const result = await generateWithAI(data);
 *     setResult(result);
 *   }, 'Gerando com IA...');
 * };
 * ```
 * 
 * The loader will only appear if the operation takes more than 400ms.
 * If it appears, it stays for at least 300ms to avoid flicker.
 */
export function useSmartLoader() {
  const { startLoading, stopLoading } = useGlobalLoader();
  const loadingCountRef = useRef(0);

  /**
   * Wraps an async operation with the smart loader.
   * Supports nested calls - loader stays visible until all operations complete.
   */
  const withLoader = useCallback(async <T>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    loadingCountRef.current += 1;
    
    // Only start if this is the first concurrent operation
    if (loadingCountRef.current === 1) {
      startLoading(message);
    }
    
    try {
      return await operation();
    } finally {
      loadingCountRef.current -= 1;
      
      // Only stop if all concurrent operations are done
      if (loadingCountRef.current === 0) {
        stopLoading();
      }
    }
  }, [startLoading, stopLoading]);

  /**
   * Manual control for cases where you can't use withLoader
   */
  const loader = {
    start: startLoading,
    stop: stopLoading,
  };

  return { withLoader, loader };
}
