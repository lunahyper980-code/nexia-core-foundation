import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserMode = 'simple' | 'advanced' | null;

interface UserModeContextType {
  mode: UserMode;
  loading: boolean;
  setMode: (mode: 'simple' | 'advanced') => Promise<void>;
  needsModeSelection: boolean;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState<UserMode>(null);
  const [loading, setLoading] = useState(true);
  const [needsModeSelection, setNeedsModeSelection] = useState(false);

  useEffect(() => {
    const fetchUserMode = async () => {
      if (!user) {
        setLoading(false);
        setNeedsModeSelection(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('usage_mode')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user mode:', error);
          setLoading(false);
          return;
        }

        const usageMode = data?.usage_mode as UserMode;
        setModeState(usageMode);
        setNeedsModeSelection(usageMode === null);
      } catch (error) {
        console.error('Error fetching user mode:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMode();
  }, [user]);

  const setMode = async (newMode: 'simple' | 'advanced') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ usage_mode: newMode })
        .eq('id', user.id);

      if (error) throw error;

      setModeState(newMode);
      setNeedsModeSelection(false);
    } catch (error) {
      console.error('Error updating user mode:', error);
      throw error;
    }
  };

  return (
    <UserModeContext.Provider value={{ mode, loading, setMode, needsModeSelection }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
}
