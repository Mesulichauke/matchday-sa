import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiUrl } from './api';

export type LocalUser = {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'consultant' | 'admin';
  approvalState: 'pending' | 'approved' | 'rejected' | 'revoked';
};

type AuthContextValue = {
  user: LocalUser | null;
  loading: boolean;
  signIn: (email: string, password: string, admin?: boolean) => Promise<{ user?: LocalUser; error?: string; code?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(url), { credentials: 'include', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || 'Request failed.'), { code: data.code });
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await request<{ user: LocalUser | null }>('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    refresh,
    signIn: async (email, password, admin = false) => {
      try {
        const data = await request<{ user: LocalUser }>(admin ? '/api/auth/admin/login' : '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        setUser(data.user);
        return data;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Unable to sign in.', code: (error as { code?: string }).code };
      }
    },
    signOut: async () => {
      await request('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      setUser(null);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}

export async function apiRequest<T>(url: string, options?: RequestInit) {
  return request<T>(url, options);
}
