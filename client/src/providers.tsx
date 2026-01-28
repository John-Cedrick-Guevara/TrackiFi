// apps/web/src/app/providers.tsx
'use client'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SupabaseContext = createContext<SupabaseClient>(supabase)

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)
