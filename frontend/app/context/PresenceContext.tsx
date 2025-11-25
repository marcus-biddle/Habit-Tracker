import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../api/client/client';

interface PresenceContextType {
  presenceState: Record<string, any>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<Record<string, any>>({});
  const presenceChannel = useRef<any>(null);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const IDLE_DELAY = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    if (!user) return;

    presenceChannel.current = supabase.channel('habit-presence', {
      config: { presence: { key: user.id } }
    });

    presenceChannel.current.on('presence', { event: 'sync' }, () => {
      setPresenceState(presenceChannel.current.presenceState());
      console.log('sync,',presenceChannel.current.presenceState())
    });

    presenceChannel.current.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        trackPresence('online');
      }
    });

    const trackPresence = (status: 'online' | 'idle') => {
      if (!presenceChannel.current) return;
      presenceChannel.current.track({
        user_id: user.id,
        status,
        last_active: Date.now(),
      });
    };

    const setIdle = () => {
      trackPresence('idle');
    };

    const resetIdleTimeout = () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      trackPresence('online');
      idleTimeout.current = setTimeout(setIdle, IDLE_DELAY);
    };

    ['mousemove', 'keydown', 'touchstart'].forEach(event =>
      window.addEventListener(event, resetIdleTimeout)
    );

    resetIdleTimeout();

    return () => {
      if (presenceChannel.current) presenceChannel.current.unsubscribe();
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      ['mousemove', 'keydown', 'touchstart'].forEach(event =>
        window.removeEventListener(event, resetIdleTimeout)
      );
    };
  }, [user]);

  return (
    <PresenceContext.Provider value={{ presenceState }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) throw new Error('usePresence must be used within PresenceProvider');
  return context;
};
