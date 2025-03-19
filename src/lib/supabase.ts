import { createClient } from '@supabase/supabase-js'

// Default values in case environment variables are not available
const SUPABASE_URL = 'http://test-supabase-7dba38-34-55-223-67.traefik.me'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc'

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: typeof window !== 'undefined', // Only persist session on client-side
    }
  })
}

// Client-side singleton instance
let supabase: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    // For server-side rendering, always create a new client
    return createSupabaseClient()
  }
  
  if (!supabase) {
    supabase = createSupabaseClient()
  }
  return supabase
}

// Server-side admin client (with service role)
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false, // Don't persist session for server-side client
    }
  })
}
