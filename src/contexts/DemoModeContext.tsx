import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUserRole } from '@/contexts/UserRoleContext';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (value: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_MODE_KEY = 'nexia_demo_mode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useUserRole();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // Initialize from sessionStorage (persists during session)
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(DEMO_MODE_KEY);
      return stored === 'true';
    }
    return false;
  });

  // Persist to sessionStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DEMO_MODE_KEY, String(isDemoMode));
    }
  }, [isDemoMode]);

  // Reset demo mode if user is not admin
  useEffect(() => {
    if (!isAdmin && isDemoMode) {
      setIsDemoMode(false);
    }
  }, [isAdmin, isDemoMode]);

  const toggleDemoMode = () => {
    if (isAdmin) {
      setIsDemoMode(prev => !prev);
    }
  };

  const setDemoMode = (value: boolean) => {
    if (isAdmin) {
      setIsDemoMode(value);
    }
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
