import { createClient } from '@supabase/supabase-js'

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return createClient(supabaseUrl, supabaseKey)
}

// Client-side singleton instance
let supabase: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabase = () => {
  if (!supabase) {
    supabase = createSupabaseClient()
  }
  return supabase
}

// Server-side admin client (with service role)
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  return createClient(supabaseUrl, supabaseServiceKey)
}
