import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ensureProfile = async (session: Session | null) => {
  if (!session?.user?.id) return;

  const email = session.user.email ?? `${session.user.id}@moneymade.local`;
  const usernameFallback =
    session.user.user_metadata?.username ??
    session.user.email?.split("@")[0] ??
    "User";
  const fullName =
    session.user.user_metadata?.full_name ??
    session.user.user_metadata?.fullName ??
    null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error checking profile:', error);
    return;
  }

  if (!data) {
    // Some projects/projects-in-progress may have a different `profiles` schema
    // (e.g. no `balance` column). Retry by dropping missing columns.
    const basePayload: Record<string, any> = {
      id: session.user.id,
      email,
      username: usernameFallback,
      full_name: fullName,
      balance: 0,
    };

    const attemptUpsert = async (payload: Record<string, any>) => {
      const { error: upsertError } = await supabase.from('profiles').upsert(payload, {
        onConflict: 'id',
      });
      if (upsertError) throw upsertError;
    };

    let payload = { ...basePayload };
    for (let i = 0; i < 3; i++) {
      try {
        await attemptUpsert(payload);
        break;
      } catch (e: any) {
        const msg = String(e?.message ?? "");
        // Supabase schema-cache errors look like:
        // "Could not find the 'balance' column of 'profiles' in the schema cache"
        const match =
          msg.match(/Could not find the '([^']+)' column of 'profiles'/) ||
          msg.match(/Could not find the '([^']+)' column/);
        if (match?.[1]) {
          const missingCol = match[1];
          if (missingCol in payload) {
            delete payload[missingCol];
            continue;
          }
        }

        const missingBalance =
          msg.includes('balance does not exist') || msg.includes('column "balance" does not exist');
        if (missingBalance && payload.balance !== undefined) {
          delete payload.balance;
          continue;
        }

        const missingUsername =
          msg.includes('username does not exist') || msg.includes('column "username" does not exist');
        if (missingUsername && payload.username !== undefined) {
          delete payload.username;
          continue;
        }

        const missingFullName =
          msg.includes('full_name does not exist') || msg.includes('column "full_name" does not exist');
        if (missingFullName && payload.full_name !== undefined) {
          delete payload.full_name;
          continue;
        }

        console.error('Error creating profile:', e);
        break;
      }
    }
  }

  // Store OAuth provider information if user signed in with OAuth
  const appMetadata = session.user.app_metadata;
  const provider = appMetadata?.provider;
  
  if (provider && provider !== 'email') {
    const providerUserId = session.user.user_metadata?.provider_id ?? 
                          session.user.user_metadata?.sub ?? 
                          session.user.id;
    const avatarUrl = session.user.user_metadata?.avatar_url ?? 
                     session.user.user_metadata?.picture ?? null;

    try {
      await supabase.from('oauth_providers').upsert({
        user_id: session.user.id,
        provider: provider,
        provider_user_id: providerUserId,
        email: session.user.email,
        avatar_url: avatarUrl,
        full_name: fullName,
        raw_user_meta_data: session.user.user_metadata,
      }, {
        onConflict: 'provider,provider_user_id',
      });
    } catch (e) {
      console.error('Error storing OAuth provider info:', e);
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await ensureProfile(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await ensureProfile(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
