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

    useEffect(() => {
        // Fetch initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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
