import { createClient } from '@supabase/supabase-js';

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Get Supabase URL with validation
const getSupabaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (envUrl && isValidUrl(envUrl)) {
    console.log('✅ Supabase URL loaded from environment variables');
    return envUrl;
  }
  
  // Fallback to a valid dummy URL if env var is invalid
  console.warn('⚠️ VITE_SUPABASE_URL is invalid or missing. Using fallback URL. Auth features may not work.');
  return 'https://dummy-project.supabase.co';
};

// Get Supabase Anon Key with validation
const getSupabaseAnonKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (envKey && envKey.length > 10) {
    console.log('✅ Supabase Anon Key loaded from environment variables');
    return envKey;
  }
  
  // Fallback to a valid dummy key if env var is invalid
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY is invalid or missing. Using fallback key. Auth features may not work.');
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkdW1teS1wcm9qZWN0IiwicmVsIjoiYW5vbiIsInN1YiI6ImR1bW15In0.dummy-key-for-fallback';
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

console.log('🔧 Supabase client initialized');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);