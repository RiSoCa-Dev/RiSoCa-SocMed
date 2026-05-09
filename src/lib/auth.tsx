import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { AuthContext, type AuthContextValue } from './authContext';

const ownerEmail =
  (import.meta.env.VITE_OWNER_EMAIL as string | undefined)?.trim().toLowerCase() ||
  null;

function isOwnerSession(session: Session | null) {
  if (!ownerEmail) return Boolean(session?.user);
  return session?.user.email?.toLowerCase() === ownerEmail;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);

      if (data.session && !isOwnerSession(data.session)) {
        await supabase.auth.signOut();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (nextSession && !isOwnerSession(nextSession)) {
        void supabase.auth.signOut();
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: isOwnerSession(session) ? session?.user ?? null : null,
      loading,
      ownerEmail,
      isOwner: isOwnerSession(session),
      accessDenied: Boolean(session && !isOwnerSession(session)),
      async signInWithGoogle() {
        const redirectTo = `${window.location.origin}/`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (error) {
          throw error;
        }
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
