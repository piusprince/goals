import { createBrowserClient as createClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Creates a Supabase client for browser/client-side usage
 * This client is used in Client Components
 */
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
