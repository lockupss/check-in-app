import { useState, useEffect } from 'react';
import { UserSession } from '../types';

// Local-session based hook: reads the demo local auth used in the app
export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      try {
        // Try server session first
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json().catch(() => null)
          if (data && data.user) {
            setUser(data.user)
            setLoading(false)
            return
          }
        }

        // Fallback to localStorage demo session
        const raw = localStorage.getItem('local-user');
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser({ id: parsed.id || 0, name: parsed.name || parsed.email, email: parsed.email, role: parsed.role || 'USER' });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession()
  }, []);

  return { user, loading };
}