import { supabase } from '@/client/client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: null | { id: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | { id: string }>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error('Login failed: ' + error.message);
  }

  if (data.session) {
    // You can get user ID from data.user.id
    setUser({id: data.user.id});
    navigate('/');
  }
};

  const register = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error('Registration failed: ' + error.message);
  }

  if (data.session) navigate('/login');
};

  const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error.message);
    return;
  }
  setUser(null);
  navigate('/login');
};

useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser({ id: user.id });
      if (!user) navigate('/login')
    }
    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const value = React.useMemo(() => ({ user, login, logout, register }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
