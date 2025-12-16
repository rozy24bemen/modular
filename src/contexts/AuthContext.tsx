import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  supabase, 
  getCurrentUser, 
  getUserProfile, 
  generateGuestId,
  isGuest 
} from '../lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  avatar_color: string;
  avatar_shape: string;
  level: number;
  xp: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isGuest: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestId] = useState(() => {
    const stored = localStorage.getItem('guestId');
    return stored || generateGuestId();
  });

  useEffect(() => {
    // Store guest ID
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', guestId);
    }

    // Check for existing session
    getCurrentUser().then(currentUser => {
      setUser(currentUser);
      
      if (currentUser) {
        // Load user profile
        getUserProfile(currentUser.id).then(userProfile => {
          setProfile(userProfile);
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      } else {
        // Guest mode
        setProfile({
          id: guestId,
          username: 'Guest',
          email: null,
          avatar_color: '#3b82f6',
          avatar_shape: 'circle',
          level: 1,
          xp: 0
        });
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        // Reset to guest
        setProfile({
          id: guestId,
          username: 'Guest',
          email: null,
          avatar_color: '#3b82f6',
          avatar_shape: 'circle',
          level: 1,
          xp: 0
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [guestId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile({
      id: guestId,
      username: 'Guest',
      email: null,
      avatar_color: '#3b82f6',
      avatar_shape: 'circle',
      level: 1,
      xp: 0
    });
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isGuest: !user,
      loading,
      signOut: handleSignOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
