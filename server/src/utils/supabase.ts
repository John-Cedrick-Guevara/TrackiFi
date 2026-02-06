// src/utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Env } from "../types/env";

export const getSupabase = (env: Env, accessToken?: string) => {
  const url = env?.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("[Supabase] Missing configuration:", {
      url: !!url,
      key: !!key,
    });
    throw new Error(
      `Supabase configuration missing (Check Bindings or .dev.vars). URL: ${!!url}, Key: ${!!key}`,
    );
  }

  const options: any = {
    auth: {
      persistSession: false, // Server-side should not persist
    },
  };

  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient(url, key, options);
};
