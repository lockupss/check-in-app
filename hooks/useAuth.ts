import { useState, useEffect } from 'react';
import { UserSession } from '../types';

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setUser(data.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, loading };
}