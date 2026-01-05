import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface GlobalLoaderContextType {
  isLoading: boolean;
  loadingMessage?: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();

  const showLoader = useCallback((message?: string) => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  }, []);

  return (
    <GlobalLoaderContext.Provider value={{ isLoading, loadingMessage, showLoader, hideLoader }}>
      {children}
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider');
  }
  return context;
}
