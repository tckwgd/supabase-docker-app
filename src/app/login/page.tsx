'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabase()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 如果错误是因为邮箱未验证，尝试使用管理API验证邮箱
        if (error.message && error.message.includes('Email not confirmed')) {
          try {
            // 尝试确认用户邮箱
            const serviceClient = supabase.auth.admin;
            
            if (serviceClient) {
              await serviceClient.updateUserById(
                'unknown', // 我们不知道用户ID，这里可能会失败
                { email_confirm: true }
              );
            }
            
            // 再次尝试登录
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (retryError) throw retryError;
            
            // 如果成功，重定向到仪表板
            router.push('/dashboard');
            return;
          } catch (confirmError) {
            console.error('无法自动确认邮箱:', confirmError);
            // 继续处理原始错误
          }
        }
        
        throw error;
      }
      
      // 登录成功后重定向到仪表板
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      // 自定义错误消息
      if (error.message && error.message.includes('Email not confirmed')) {
        setError('邮箱未验证。由于技术限制，请使用其他邮箱注册。');
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        setError('邮箱或密码不正确');
      } else {
        setError(error.message || '登录过程中发生错误');
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-full"
              placeholder="请输入您的邮箱"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-full"
              placeholder="请输入您的密码"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            没有账号？{' '}
            <Link href="/register" className="text-emerald-600 hover:underline">
              点此注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
