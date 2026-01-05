import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEnsureProfile() {
  const ensureProfile = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('[ensureProfile] No authenticated user');
        return null;
      }

      console.log('[ensureProfile] Ensuring profile for user:', user.id);

      // Try to get existing profile first
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id, access_status, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('[ensureProfile] Error checking profile:', selectError);
      }

      // If profile exists, just update last_login_at equivalent (updated_at)
      if (existingProfile) {
        console.log('[ensureProfile] Profile exists, updating timestamp');
        await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);
        return existingProfile;
      }

      // Profile doesn't exist, create it
      console.log('[ensureProfile] Creating new profile');
      const { data: newProfile, error: insertError } = await supabase
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
        })
        .select()
        .single();

      if (insertError) {
        console.error('[ensureProfile] Error creating profile:', insertError);
        toast.error('Falha ao sincronizar perfil');
        return null;
      }

      console.log('[ensureProfile] Profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('[ensureProfile] Unexpected error:', error);
      toast.error('Falha ao sincronizar perfil');
      return null;
    }
  }, []);

  return { ensureProfile };
}
