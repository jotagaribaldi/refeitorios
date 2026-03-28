import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  tenant?: { name: string };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('muser') || 'null'); }
    catch { return null; }
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    localStorage.setItem('mtoken', data.accessToken);
    localStorage.setItem('muser', JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mtoken');
    localStorage.removeItem('muser');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
