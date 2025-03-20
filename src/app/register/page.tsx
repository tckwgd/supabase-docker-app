'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function Register() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabase()

  const handleAnonymousSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    if (!username.trim()) {
      setError('用户名不能为空')
      setLoading(false)
      return
    }

    try {
      // 使用匿名登录方式
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      console.log('匿名登录成功:', data);
      
      // 将用户名存储到用户元数据中
      if (data.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { username: username }
        });
        
        if (updateError) {
          console.error('更新用户名失败:', updateError);
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('注册错误:', error);
      
      // 处理各种错误情况
      if (error.message && error.message.includes('JWT')) {
        setError('授权错误，请稍后再试');
      } else {
        setError(error.message || '注册过程中发生错误');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">快速注册</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            注册成功！正在重定向到仪表板...
          </div>
        )}
        
        <form onSubmit={handleAnonymousSignup} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input w-full"
              placeholder="请输入您的用户名"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || success}
          >
            {loading ? '加载中...' : '快速注册并登录'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            已有账号？{' '}
            <Link href="/login" className="text-emerald-600 hover:underline">
              点此登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
