import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing from the environment variables.');
}

/**
 * Access the configured Supabase client.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
