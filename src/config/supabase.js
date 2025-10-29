import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Enable email confirmation for security
    autoConfirm: false,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    storageKey: 'supabase.auth.token',
    debug: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'food-delivery-app',
    },
  },
});