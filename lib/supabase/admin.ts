import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // Disable session persistence and auto-refresh for an admin client
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);