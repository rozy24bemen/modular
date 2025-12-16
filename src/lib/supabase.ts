import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          avatar_color: string;
          avatar_shape: string;
          level: number;
          xp: number;
          created_at: string;
          last_seen: string;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          avatar_color?: string;
          avatar_shape?: string;
          level?: number;
          xp?: number;
        };
        Update: {
          username?: string;
          email?: string | null;
          avatar_color?: string;
          avatar_shape?: string;
          level?: number;
          xp?: number;
        };
      };
    };
  };
}

// Auth helpers
export async function signUpWithEmail(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      }
    }
  });

  if (error) throw error;

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        username,
        email,
      });

    if (profileError) throw profileError;
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithEmail({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Guest mode helper
export function generateGuestId() {
  return `guest_${Math.random().toString(36).substr(2, 9)}`;
}

export function isGuest(userId: string) {
  return userId.startsWith('guest_');
}
