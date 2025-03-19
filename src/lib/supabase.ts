import { createClient } from '@supabase/supabase-js'

// 确保这里的 URL 方案与 Supabase 实例匹配（HTTP 而不是 HTTPS）
const SUPABASE_URL = 'http://test-supabase-7dba38-34-55-223-67.traefik.me'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc'

// 创建客户端
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  
  console.log('创建 Supabase 客户端，URL:', supabaseUrl)
  
  // 添加重要的配置选项
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: typeof window !== 'undefined', // 仅在客户端持久化会话
      autoRefreshToken: true,
      detectSessionInUrl: false, // 不从 URL 查询参数检测会话
      flowType: 'implicit', // 使用隐式流程，适用于 SPA
      debug: true
    },
    global: {
      fetch: fetch, // 使用标准的 fetch 实现
      headers: {
        'X-Client-Info': 'supabase-docker-app'
      }
    },
    // 关键：不自动检测 URL 方案，使用我们指定的方案（HTTP）
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

// 客户端单例
let supabase: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    // 服务端渲染时创建新客户端
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
      detectSessionInUrl: false,
      flowType: 'implicit',
      debug: true
    }
  })
}
