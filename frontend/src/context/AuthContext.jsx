import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const response = await api.get('/auth/verify');
        if (mounted && response?.data?.user) setUser(response.data.user);
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (mounted) { setUser(null); setToken(null); }
      } finally { if (mounted) setLoading(false); }
    };
    verify();
    return () => { mounted = false; };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = data.data || data;
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password, secretKey }) => {
    const data = await api.post('/auth/register', { name, email, password, secretKey });
    const { token: newToken, user: newUser } = data.data || data;
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    window.location.href = '/admin/login';
  }, []);

  const isAdmin = useMemo(() => !!user && user.role === 'admin', [user]);

  const value = useMemo(() => ({ user, token, loading, login, register, logout, isAdmin }), [user, token, loading, login, register, logout, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
