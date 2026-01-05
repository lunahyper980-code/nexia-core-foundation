import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'user' | 'admin' | 'owner';

interface UserRoleContextType {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isAdminOrOwner: boolean;
  refetchRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateRole = async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // First, try to get existing role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No role exists, create one with default 'user'
        const { data: newRole, error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'user' })
          .select('role')
          .single();

        if (insertError) {
          console.error('Error creating user role:', insertError);
          setRole('user'); // Fallback to user
        } else {
          setRole(newRole?.role as AppRole || 'user');
        }
      } else if (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Fallback to user
      } else {
        setRole(data?.role as AppRole || 'user');
      }
    } catch (err) {
      console.error('Error in role management:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isOwner = role === 'owner';
  const isAdminOrOwner = role === 'admin' || role === 'owner';

  return (
    <UserRoleContext.Provider value={{ 
      role, 
      loading, 
      isAdmin, 
      isOwner, 
      isAdminOrOwner,
      refetchRole: fetchOrCreateRole 
    }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
