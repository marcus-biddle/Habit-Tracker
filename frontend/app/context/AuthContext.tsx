import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../api/client/client';
import { Spinner } from '../components/ui/spinner';

interface AuthContextType {
  user: null | { id: string; email: string; avatar: string };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | { id: string; email: string; avatar: string }>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Login failed: ' + error.message);
    if (data.session && data.user) {
      setUser({ id: data.user.id, email: data.user.email ?? email, avatar: '' });
      navigate('/dashboard');
    } else {
      throw new Error('Login failed: no session returned');
    }
  };

  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error('Registration failed: ' + error.message);
    if (data.session === null) {
      // After sign up, user usually needs to confirm email and then login
      navigate('/login');
    }
  };

  const logout = async () => {
  const session = supabase.auth.getSession();
  if (!session) {
    console.warn("No active session. Skipping sign out API call.");
    setUser(null);
    navigate('/login');
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    return;
  }
  setUser(null);
  navigate('/login');
};


  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('here', location.pathname)

      if (!mounted) return;

      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          avatar: '',
        });
      } else {
        setUser(null);
        // navigate('/login');
      }
      setLoading(false);
    }

    initialize();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          avatar: '',
        });
      } else {
        setUser(null);
        // navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
  if (
    !loading && 
    !user && 
    location.pathname !== '/login' && 
    location.pathname !== '/register'
  ) {
    navigate('/login');
  }
}, [loading, user, navigate, location.pathname]);

  const value = React.useMemo(() => ({ user, login, logout, register }), [user]);

  if (loading) {
    return <div className='h-screen w-full flex justify-center items-center'><Spinner /></div>; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
