import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const serverConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Anonymous server-side client (public anon key, no session). Only ever sees what RLS allows the public to see. */
export function getAnonClient(): SupabaseClient | null {
  if (!serverConfigured) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
