import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to ensure profile exists
async function ensureProfile(user: User) {
  if (!user) return;
  
  console.log('[ensureProfile] Ensuring profile for user:', user.id);

  try {
    // Check if profile exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[ensureProfile] Error checking profile:', selectError);
    }

    // If profile exists, just update timestamp
    if (existingProfile) {
      console.log('[ensureProfile] Profile exists, updating timestamp');
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);
      return;
    }

    // Profile doesn't exist, create it
    console.log('[ensureProfile] Creating new profile');
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        access_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error('[ensureProfile] Error creating profile:', insertError);
      toast.error('Falha ao sincronizar perfil');
    } else {
      console.log('[ensureProfile] Profile created successfully');
    }
  } catch (error) {
    console.error('[ensureProfile] Unexpected error:', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Ensure profile exists on sign in or token refresh
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(() => {
            ensureProfile(session.user);
          }, 100);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Ensure profile exists on initial load
      if (session?.user) {
        setTimeout(() => {
          ensureProfile(session.user);
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear all navigation states on logout
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('nexia_nav_') || key.startsWith('nexia_demo_')) {
        sessionStorage.removeItem(key);
      }
    });
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
