'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { User, AuthContextValue } from '@/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      setToken(stored);
      api.get('/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('auth_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistToken = (t: string) => {
    localStorage.setItem('auth_token', t);
    setToken(t);
  };

  async function login(email: string, password: string) {
    const res = await api.post('/login', { email, password });
    persistToken(res.data.token);
    const me = await api.get('/me');
    setUser(me.data);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post('/register', { name, email, password });
    persistToken(res.data.token);
    setUser(res.data.user);
  }

  async function logout() {
    await api.post('/logout').catch(() => {});
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
