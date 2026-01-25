import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type AuthLevel = 'none' | 'partial' | 'full';

interface AuthSession {
  auth_level: AuthLevel;
  partial_expires_at: string | null;
  failed_attempts: number;
  lockout_until: string | null;
}

export const useTwoStepAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLevel, setAuthLevel] = useState<AuthLevel>('none');
  const [loading, setLoading] = useState(true);
  const [partialExpiresAt, setPartialExpiresAt] = useState<Date | null>(null);

  // Fetch auth session from database
  const fetchAuthSession = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('auth_sessions')
      .select('auth_level, partial_expires_at, failed_attempts, lockout_until')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching auth session:', error);
      return null;
    }

    return data as AuthSession | null;
  }, []);

  // Check if partial auth has expired
  const checkPartialExpiry = useCallback((session: AuthSession | null) => {
    if (!session) return 'none';
    
    if (session.auth_level === 'partial' && session.partial_expires_at) {
      const expiresAt = new Date(session.partial_expires_at);
      if (new Date() > expiresAt) {
        return 'none'; // Expired
      }
      setPartialExpiresAt(expiresAt);
    }
    
    return session.auth_level;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const authSession = await fetchAuthSession(session.user.id);
        const level = checkPartialExpiry(authSession);
        setAuthLevel(level);
      } else {
        setUser(null);
        setAuthLevel('none');
      }
      
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          // Defer Supabase calls
          setTimeout(async () => {
            if (!mounted) return;
            const authSession = await fetchAuthSession(session.user.id);
            const level = checkPartialExpiry(authSession);
            setAuthLevel(level);
          }, 0);
        } else {
          setUser(null);
          setAuthLevel('none');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAuthSession, checkPartialExpiry]);

  // Set partial auth after first password
  const setPartialAuth = useCallback(async () => {
    if (!user) return false;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    const { error } = await supabase
      .from('auth_sessions')
      .upsert({
        user_id: user.id,
        auth_level: 'partial',
        partial_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error setting partial auth:', error);
      return false;
    }

    setAuthLevel('partial');
    setPartialExpiresAt(expiresAt);
    return true;
  }, [user]);

  // Verify PIN and get full auth
  const verifyPin = useCallback(async (pin: string): Promise<{ success: boolean; error?: string; locked?: boolean; expired?: boolean }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    try {
      const response = await supabase.functions.invoke('verify-pin', {
        body: { pin }
      });

      if (response.error) {
        return { success: false, error: 'Invalid credentials' };
      }

      const data = response.data;

      if (data.error) {
        return { 
          success: false, 
          error: data.error,
          locked: data.locked,
          expired: data.expired
        };
      }

      if (data.success && data.auth_level === 'full') {
        setAuthLevel('full');
        setPartialExpiresAt(null);
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('PIN verification error:', error);
      return { success: false, error: 'Invalid credentials' };
    }
  }, [user]);

  // Sign out completely
  const signOut = useCallback(async () => {
    if (user) {
      // Clear auth session
      await supabase
        .from('auth_sessions')
        .update({ 
          auth_level: 'none', 
          partial_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setAuthLevel('none');
    setPartialExpiresAt(null);
  }, [user]);

  // Refresh auth state
  const refreshAuthState = useCallback(async () => {
    if (!user) return;
    
    const authSession = await fetchAuthSession(user.id);
    const level = checkPartialExpiry(authSession);
    setAuthLevel(level);
  }, [user, fetchAuthSession, checkPartialExpiry]);

  return {
    user,
    authLevel,
    loading,
    partialExpiresAt,
    setPartialAuth,
    verifyPin,
    signOut,
    refreshAuthState,
    isAuthenticated: authLevel === 'full',
    isPartialAuth: authLevel === 'partial',
  };
};
