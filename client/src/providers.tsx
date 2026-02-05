// apps/web/src/app/providers.tsx
"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "trackifi-auth-session",
  },
});

const SupabaseContext = createContext<SupabaseClient>(supabase);

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 72, // 72 hours
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 72, // 72 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);
