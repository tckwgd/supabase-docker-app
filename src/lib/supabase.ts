import { createClient } from '@supabase/supabase-js'

// 默认值 - 使用你的 Supabase 实例的确切值
const SUPABASE_URL = 'http://pro-version-supabase-1936aa-129-213-192-141.traefik.me'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc'

// 创建客户端
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  
  console.log('创建 Supabase 客户端，URL:', supabaseUrl)
  
  // 创建无 JWT 验证的客户端
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js/2.x'
      }
    }
  })
}

// 客户端单例
let supabase: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    // 对于服务端渲染，总是创建新客户端
    return createSupabaseClient()
  }
  
  if (!supabase) {
    supabase = createSupabaseClient()
  }
  return supabase
}

// 服务端管理客户端
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

// 创建一个基本的 HTTP 客户端，无需 JWT
export const createHttpClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  
  return {
    async request(endpoint: string, options: RequestInit = {}) {
      const url = `${supabaseUrl}${endpoint}`
      const headers = {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        ...options.headers
      }
      
      try {
        const response = await fetch(url, {
          ...options,
          headers
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('HTTP request failed:', error)
        throw error
      }
    },
    
    async createUser(email: string, password: string) {
      return this.request('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
    },
    
    async login(email: string, password: string) {
      return this.request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
    }
  }
}