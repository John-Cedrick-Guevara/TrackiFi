// apps/web/src/app/providers.tsx
"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SupabaseContext = createContext<SupabaseClient>(supabase);

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);
