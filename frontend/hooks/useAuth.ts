'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setDbUser = useAuthStore((s) => s.setDbUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clearUser = useAuthStore((s) => s.clearUser);
  const user = useAuthStore((s) => s.user);
  const dbUser = useAuthStore((s) => s.dbUser);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const syncDbUser = async (userId: string) => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch {
        // Non-fatal — dbUser stays null
      }
    };

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        syncDbUser(currentUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        syncDbUser(session.user.id);
      } else {
        clearUser();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { user, dbUser, isLoading };
}
