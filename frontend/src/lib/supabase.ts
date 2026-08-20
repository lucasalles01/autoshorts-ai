import { createClient } from '@supabase/supabase-js';

// New Supabase project credentials - Force use hardcoded credentials
const SUPABASE_URL = 'https://rsmfccivskwwfbazqxdg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iAewqK7cM3NhaXUblrytmw__XuUAwzv';

console.log('🔧 Supabase client initialized with URL:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);