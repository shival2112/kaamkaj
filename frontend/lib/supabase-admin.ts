import { createClient } from '@supabase/supabase-js';

// Service-role client — never import this on the client side.
// Used only in API routes / Server Actions to perform admin operations.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
