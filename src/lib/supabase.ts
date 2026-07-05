import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn but don't crash — app will show landing page without a backend connection
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);