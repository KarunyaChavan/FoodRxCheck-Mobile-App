/**
 * @file Provides authentication state, profile lookup, and role flags using decoupled api layer.
 */

import { Session } from '@supabase/supabase-js';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import supabase from '../lib/supabase';
import { fetchProfile } from '../services/api/auth';
import { UserProfile } from '../types/database.types';

type AuthData = {
  session: Session | null;
  loading: boolean;
  user: UserProfile | null;
  isAdmin: boolean;
  isHcp: boolean;
  resetPending: boolean;
  setResetPending: (value: boolean) => void;
};

const AuthContext = createContext<AuthData | undefined>(undefined);

/**
 * Owns the Supabase session lifecycle and exposes user role state to screens.
 */
export default function AuthProvider({ children }: PropsWithChildren) {
  const [authState, setAuthState] = useState<AuthData>({
    session: null,
    loading: true,
    user: null,
    isAdmin: false,
    isHcp: false,
    resetPending: false,
    setResetPending: () => {},
  });

  const setResetPending = (value: boolean) => {
    setAuthState((prev) => ({ ...prev, resetPending: value }));
  };

  const loadUserProfile = useCallback(
    async (userId: string, session: Session | null = authState.session) => {
      if (authState.resetPending) {
        return;
      }

      try {
        const data = await fetchProfile(userId);

        setAuthState((prev) => ({
          ...prev,
          session,
          loading: false,
          user: data,
          isAdmin: data.role === 'admin',
          isHcp: data.role === 'hcp',
          resetPending: false,
        }));
      } catch (err) {
        console.error('Unexpected error fetching user profile:', err);
      }
    },
    [authState.resetPending, authState.session],
  );

  useEffect(() => {
    if (authState.resetPending) {
      return;
    }

    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        setAuthState((prev) => ({ ...prev, loading: false }));
        return;
      }

      if (session) {
        await loadUserProfile(session.user.id, session);
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserProfile(session.user.id, session);
      } else {
        setAuthState((prev) => ({
          session: null,
          loading: false,
          user: null,
          isAdmin: false,
          isHcp: false,
          resetPending: false,
          setResetPending,
        }));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [authState.resetPending, loadUserProfile]);

  return <AuthContext.Provider value={{ ...authState }}>{children}</AuthContext.Provider>;
}

/**
 * Reads the current authentication context inside provider-wrapped screens.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
