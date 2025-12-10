
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://htaqhjqwkzwkwidazqmm.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_ANON_KEY) {
  console.error('VITE_SUPABASE_KEY is not set in environment variables')
}

if (!SUPABASE_URL) {
  console.error('SUPABASE_URL is not set')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});