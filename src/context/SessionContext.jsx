/**
 * Session & role.
 * - Real mode: Supabase Auth session + profiles.role ('client' | 'adviser' | 'admin').
 * - DEMO MODE (hackathon only): switch between Client View and Adviser View
 *   without accounts. Controlled by VITE_ENABLE_DEMO_MODE. Remove before launch.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase.js';
import { DEMO_MODE_ENABLED, IS_SUPABASE_CONFIGURED } from '../config/env.js';

const SessionContext = createContext(null);
const DEMO_ROLE_KEY = 'rsf-demo-role';

function readDemoRole() {
  try {
    return window.localStorage.getItem(DEMO_ROLE_KEY) || 'client';
  } catch {
    return 'client';
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(IS_SUPABASE_CONFIGURED);
  const [demoRole, setDemoRoleState] = useState(readDemoRole);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('id, role, full_name, email')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const setDemoRole = useCallback((role) => {
    setDemoRoleState(role);
    try {
      window.localStorage.setItem(DEMO_ROLE_KEY, role);
    } catch {
      /* ignore */
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(session?.user);
    const usingDemo = !isAuthenticated && DEMO_MODE_ENABLED;
    return {
      role: isAuthenticated ? profile?.role || null : usingDemo ? demoRole : null,
      isDemo: usingDemo,
      demoModeEnabled: DEMO_MODE_ENABLED,
      isAuthenticated,
      user: session?.user || null,
      profile,
      loading: authLoading || (isAuthenticated && !profile),
      setDemoRole,
      signIn,
      signOut,
    };
  }, [session, profile, demoRole, authLoading, setDemoRole, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
