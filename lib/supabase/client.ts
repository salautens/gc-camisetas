import { normalizeSupabaseConfig } from './config'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    normalizeSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    normalizeSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  )
}
