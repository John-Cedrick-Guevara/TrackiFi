// src/utils/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Env } from "../types/env";

export const getSupabase = (env: Env, accessToken?: string) => {
  // Debugging logs to verify environment variables
  console.log("Supabase Env Check - Keys:", Object.keys(env || {}));
  console.log("Supabase URL present:", !!env?.SUPABASE_URL);
  console.log(
    "Supabase Key present:",
    !!(env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_ANON_KEY),
  );

  const url = env?.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase configuration missing (Check .dev.vars or wrangler.toml). URL: ${!!url}, Key: ${!!key}`,
    );
  }

  const options: any = {};
  if (accessToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient(url, key, options);
};
