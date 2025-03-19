import { createClient } from '@supabase/supabase-js'

// 从环境变量中提取的默认值 - 使用你的 Supabase 实例的确切值
const SUPABASE_URL = 'http://test-supabase-7dba38-34-55-223-67.traefik.me'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc'

// 创建客户端时添加更多选项和调试信息
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  
  console.log('创建 Supabase 客户端，URL:', supabaseUrl)
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: typeof window !== 'undefined', // 仅在客户端持久化会话
      detectSessionInUrl: true,
      autoRefreshToken: true,
      debug: true // 启用调试模式以获取更多日志
    },
    global: {
      headers: {
        'x-custom-header': 'supabase-docker-app'
      }
    }
  })
}

// 客户端单例实例
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

// 服务端管理客户端（使用服务角色）
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY
  
  console.log('创建 Supabase 服务客户端，URL:', supabaseUrl)
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false, // 不持久化服务端客户端的会话
      autoRefreshToken: false,
      debug: true
    }
  })
}
