import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const PING_URL = 'https://www.google.com/favicon.ico';
const CHECK_INTERVAL = 30000; // 30 seconds

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isChecking: false,
    lastChecked: null,
  });
  
  const wasOfflineRef = useRef(false);

  // Real connectivity check via fetch
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Try to fetch a tiny resource with cache-busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${PING_URL}?_=${Date.now()}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // no-cors mode returns opaque response with status 0
      const isConnected = response.type === 'opaque' || response.ok;
      
      // Show toast if connection was restored
      if (isConnected && wasOfflineRef.current) {
        toast.success('Conexão restaurada', {
          description: 'Você está online novamente',
          duration: 3000,
        });
        wasOfflineRef.current = false;
      }
      
      setStatus({
        isOnline: isConnected,
        isChecking: false,
        lastChecked: new Date(),
      });
      
      return isConnected;
    } catch (error) {
      // If navigator says online but fetch fails, try one more time
      if (navigator.onLine) {
        try {
          // Fallback: try to fetch the app's own assets
          const fallbackController = new AbortController();
          const fallbackTimeout = setTimeout(() => fallbackController.abort(), 3000);
          
          await fetch('/favicon.ico?' + Date.now(), {
            method: 'HEAD',
            cache: 'no-store',
            signal: fallbackController.signal,
          });
          
          clearTimeout(fallbackTimeout);
          
          // Show toast if connection was restored
          if (wasOfflineRef.current) {
            toast.success('Conexão restaurada', {
              description: 'Você está online novamente',
              duration: 3000,
            });
            wasOfflineRef.current = false;
          }
          
          setStatus({
            isOnline: true,
            isChecking: false,
            lastChecked: new Date(),
          });
          return true;
        } catch {
          // Both checks failed, we're likely offline
        }
      }
      
      wasOfflineRef.current = true;
      
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
      });
      
      return false;
    }
  }, []);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // When browser says we're online, verify with a real check
      checkConnectivity();
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnectivity();

    // Periodic check when online
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnectivity();
      }
    }, CHECK_INTERVAL);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnectivity]);

  const retry = useCallback(async () => {
    return checkConnectivity();
  }, [checkConnectivity]);

  return {
    ...status,
    retry,
  };
}
