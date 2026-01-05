import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AccessStatus = 'pending' | 'active' | 'blocked';

export interface AccessControlState {
  status: AccessStatus;
  reason: string | null;
  deviceId: string | null;
  isDeviceBlocked: boolean;
  loading: boolean;
}

// Generate or retrieve device ID from localStorage
const getOrCreateDeviceId = (): string => {
  const DEVICE_ID_KEY = 'nexia_device_id';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

export function useAccessControl() {
  const { user } = useAuth();
  const [state, setState] = useState<AccessControlState>({
    status: 'pending',
    reason: null,
    deviceId: null,
    isDeviceBlocked: false,
    loading: true,
  });

  const checkDeviceBlocked = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_device_blocked', { 
        _device_id: deviceId 
      });
      
      if (error) {
        console.error('Error checking device blocked:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Error in checkDeviceBlocked:', error);
      return false;
    }
  }, []);

  const saveDeviceId = useCallback(async (userId: string, deviceId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ device_id: deviceId })
        .eq('id', userId)
        .is('device_id', null);
      
      if (error) {
        console.error('Error saving device_id:', error);
      }
    } catch (error) {
      console.error('Error in saveDeviceId:', error);
    }
  }, []);

  const fetchAccessStatus = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const currentDeviceId = getOrCreateDeviceId();
      
      // Check if this device is already blocked
      const deviceBlocked = await checkDeviceBlocked(currentDeviceId);
      
      if (deviceBlocked) {
        setState({
          status: 'blocked',
          reason: 'Dispositivo bloqueado por segurança',
          deviceId: currentDeviceId,
          isDeviceBlocked: true,
          loading: false,
        });
        return;
      }

      // Fetch user profile with access status
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('access_status, access_reason, device_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching access status:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const accessStatus = (profile?.access_status as AccessStatus) || 'pending';
      
      // If user is active and doesn't have device_id, save it
      if (accessStatus === 'active' && !profile?.device_id) {
        await saveDeviceId(user.id, currentDeviceId);
      }

      setState({
        status: accessStatus,
        reason: profile?.access_reason || null,
        deviceId: profile?.device_id || currentDeviceId,
        isDeviceBlocked: false,
        loading: false,
      });

    } catch (error) {
      console.error('Error in fetchAccessStatus:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user, checkDeviceBlocked, saveDeviceId]);

  useEffect(() => {
    fetchAccessStatus();
  }, [fetchAccessStatus]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('access-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchAccessStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAccessStatus]);

  return {
    ...state,
    refetch: fetchAccessStatus,
    hasAccess: state.status === 'active' && !state.isDeviceBlocked,
  };
}
