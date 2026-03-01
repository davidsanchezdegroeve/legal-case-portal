/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthProfile {
    id: string;
    role: 'admin' | 'lawyer';
    full_name: string | null;
    company_name: string | null;
    avatar_url: string | null;
    company_logo_url: string | null;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: AuthProfile | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<AuthProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function initializeAuth() {
            try {
                // Fetch initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setIsLoading(false);
                    }
                    setIsInitialized(true);
                }
            } catch (err) {
                console.error("Auth initialization failed:", err);
                if (mounted) setIsLoading(false);
            }
        }

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_IN' && session?.user) {
                // Fire and forget logging so we don't block the UI rendering on reload
                supabase.from('auth_logs').insert({
                    user_id: session.user.id,
                    email: session.user.email,
                    event_type: 'login'
                }).then(({ error }) => {
                    if (error) console.error('Failed to log sign in:', error);
                });
            }

            if (session?.user) {
                // Only fetch profile if we haven't already initialized it (avoids double fetch on initial load)
                if (isInitialized) {
                    await fetchProfile(session.user.id);
                }
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [isInitialized]);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data as AuthProfile);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        if (user) {
            try {
                await supabase.from('auth_logs').insert({
                    user_id: user.id,
                    email: user.email,
                    event_type: 'logout'
                });
            } catch (e) {
                console.error('Failed to log sign out:', e);
            }
        }
        await supabase.auth.signOut();
    };

    const updateProfile = async (updates: Partial<AuthProfile>) => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, ...updates })
                .select()
                .single();

            if (error) throw error;

            setProfile(prev => prev ? { ...prev, ...updates } : (data as AuthProfile));
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, isLoading, signOut, updateProfile }}>
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
