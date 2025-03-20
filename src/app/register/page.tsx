'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabase()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    // 密码验证
    if (password !== confirmPassword) {
      setError('密码不匹配')
      setLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('密码至少需要6个字符')
      setLoading(false)
      return
    }

    try {
      // 使用标准 Auth API 进行注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            email: email
          }
        }
      });
      
      if (error) throw error;
      
      console.log('注册成功:', data);
      
      // 尝试自动登录 - 对于自动确认设置可能有效
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!signInError) {
          setSuccess(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
          return;
        }
      } catch (loginError) {
        // 忽略登录尝试中的错误
        console.log('自动登录尝试失败，这是正常的');
      }
      
      // 如果我们到达这里，用户创建成功但需要确认
      setSuccess(true);
      setError('请检查您的邮箱进行账户验证');
      
    } catch (error: any) {
      console.error('注册错误:', error);
      
      // 处理各种错误情况
      if (error.message && error.message.includes('User already registered')) {
        setError('该邮箱已注册，请直接登录或找回密码');
      } else if (error.message && error.message.includes('JWT')) {
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
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            注册成功！{error ? '' : '正在重定向到仪表板...'}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
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
              placeholder="创建密码"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input w-full"
              placeholder="确认您的密码"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || success}
          >
            {loading ? '加载中...' : '注册'}
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
