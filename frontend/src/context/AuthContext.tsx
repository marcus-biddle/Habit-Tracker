import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: null | { email: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | { email: string }>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();

    // Data contains { message, success, id }
    console.log('login response data:', data);
    
    setUser(data.id);
    navigate('/');
  };

  const register = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    navigate('/login');
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  const value = React.useMemo(() => ({ user, login, logout, register }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
