import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://duaifeizjnonvzbxcpmib.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key-for-development';

// Validate that we have valid credentials
if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'fallback-key-for-development') {
  console.warn('Supabase credentials not properly configured. Auth features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);