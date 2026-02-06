// src/utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Env } from "../types/env";

export const getSupabase = (env: Env, accessToken?: string) => {
  const url = env?.SUPABASE_URL;
  
  // CRITICAL: Always use ANON_KEY when working with user tokens
  // SERVICE_ROLE_KEY bypasses RLS and should only be used for admin operations
  const key = env?.SUPABASE_ANON_KEY;
  
  // Fallback to SERVICE_ROLE_KEY only if ANON_KEY is not available (not recommended)
  const actualKey = key || env?.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !actualKey) {
    console.error("[Supabase] Missing configuration:", {
      url: !!url,
      hasAnonKey: !!env?.SUPABASE_ANON_KEY,
      hasServiceKey: !!env?.SUPABASE_SERVICE_ROLE_KEY,
      usingKey: key ? 'ANON' : 'SERVICE_ROLE',
    });
    throw new Error(
      `Supabase configuration missing (Check Bindings or .dev.vars). URL: ${!!url}, Key: ${!!actualKey}`,
    );
  }

  const options: any = {
    auth: {
      persistSession: false, // Server-side should not persist
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };

  // When access token is provided, set it in global headers
  // This allows RLS policies to work correctly with the user's context
  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    console.log("[Supabase] Client initialized with user access token");
  } else {
    console.warn("[Supabase] Client initialized without access token - operations will run as anon");
  }

  return createClient(url, actualKey, options);
};
