import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missing = [
      !url && "SUPABASE_URL",
      !key && "SUPABASE_SERVICE_ROLE_KEY",
    ].filter(Boolean);
    console.warn(
      `[supabase] Missing env var(s): ${missing.join(", ")}. Add them in Vercel → Settings → Environment Variables and redeploy.`
    );
    return null;
  }

  _client = createClient(url, key);
  return _client;
}
