import { createClient } from '@supabase/supabase-js';

// New Supabase project credentials
const FALLBACK_SUPABASE_URL = 'https://rsmfccivskwwfbazqxdg.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_iAewqK7cM3NhaXUblrytmw__XuUAwzv';

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
  
  // Use hardcoded fallback with new project credentials
  console.warn('⚠️ VITE_SUPABASE_URL is invalid or missing. Using new project fallback.');
  return FALLBACK_SUPABASE_URL;
};

// Get Supabase Anon Key with validation
const getSupabaseAnonKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (envKey && envKey.length > 10 && envKey !== 'your-supabase-anon-key-here') {
    console.log('✅ Supabase Anon Key loaded from environment variables');
    return envKey;
  }
  
  // Use hardcoded fallback with new project credentials
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY is invalid or missing. Using new project fallback.');
  return FALLBACK_SUPABASE_ANON_KEY;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

console.log('🔧 Supabase client initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);