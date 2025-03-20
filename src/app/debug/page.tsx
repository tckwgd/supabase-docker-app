'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://pro-version-supabase-1936aa-129-213-192-141.traefik.me:8000'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc'
const JWT_SECRET = 'Zp+MpJptTk1gpzNQrqFLu+MiqAFoejM2aGNNc9mvu1k='

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  const [status, setStatus] = useState<any>(null)
  const [connectionInfo, setConnectionInfo] = useState<any>(null)
  
  // 测试 Supabase 连接
  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setStatus(null)
    
    try {
      // 获取环境变量
      const envInfo = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY,
        JWT_SECRET: process.env.JWT_SECRET || JWT_SECRET
      }
      
      setConnectionInfo(envInfo)
      
      // 创建客户端
      const supabase = createClient(envInfo.NEXT_PUBLIC_SUPABASE_URL, envInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })
      
      // 测试健康状态 API
      const statusResponse = await fetch(`${envInfo.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`)
        .then(res => ({
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries([...res.headers.entries()])
        }))
        .catch(err => ({ error: err.message }))
      
      setStatus(statusResponse)
      
      // 尝试执行 SQL 查询
      const { data, error } = await supabase
        .from('_realtime')
        .select('*')
        .limit(1)
      
      if (error) throw error
      
      setResponse({
        success: true,
        data
      })
    } catch (err: any) {
      setError(err.message || '连接测试失败')
      setResponse({
        success: false,
        error: err
      })
    } finally {
      setLoading(false)
    }
  }
  
  // 尝试直接解码 JWT 令牌
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { error: 'Invalid token format' }
      }
      
      // 解码头部和载荷
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))
      
      return {
        header,
        payload,
        signature: parts[2]
      }
    } catch (err: any) {
      return {
        error: err.message || 'Failed to decode token',
        token: token
      }
    }
  }
  
  // 测试注册
  const testSignUp = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      const email = `test_${Date.now()}@example.com`
      const password = 'test123456'
      
      const envInfo = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
      }
      
      // 创建新客户端，并直接尝试注册
      const supabase = createClient(envInfo.NEXT_PUBLIC_SUPABASE_URL, envInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      })
      
      // 解码 JWT 令牌
      const decodedToken = decodeJWT(envInfo.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      // 尝试注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: null
        }
      })
      
      if (error) throw error
      
      setResponse({
        success: true,
        data,
        decodedToken
      })
    } catch (err: any) {
      setError(err.message || '注册测试失败')
      setResponse({
        success: false,
        error: err.toString(),
        decodedToken: decodeJWT(SUPABASE_ANON_KEY)
      })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    // 可选：页面加载时自动测试
    // testConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Supabase 连接调试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">连接测试</h2>
          
          <button 
            onClick={testConnection} 
            className="btn btn-primary mb-4"
            disabled={loading}
          >
            {loading ? '测试中...' : '测试 Supabase 连接'}
          </button>
          
          <button 
            onClick={testSignUp} 
            className="btn btn-secondary ml-2 mb-4"
            disabled={loading}
          >
            测试注册功能
          </button>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">错误：</p>
              <p>{error}</p>
            </div>
          )}
          
          {connectionInfo && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">环境变量：</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
                {JSON.stringify(connectionInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {status && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">API 状态：</h3>
              <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">响应结果</h2>
          
          {response && (
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
