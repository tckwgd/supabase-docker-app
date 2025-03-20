'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function Register() {
  const [phone, setPhone] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabase()

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    if (!phone.trim()) {
      setError('手机号不能为空')
      setLoading(false)
      return
    }

    if (!username.trim()) {
      setError('用户名不能为空')
      setLoading(false)
      return
    }

    try {
      // 使用手机号码登录方式 - 由于开启了自动确认，不需要OTP
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: phone,
        password: "default-password", // 使用默认密码
      });
      
      // 如果是新用户，先注册
      if (error && error.message.includes('Invalid login credentials')) {
        console.log('用户不存在，尝试注册...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          phone: phone,
          password: "default-password", // 使用默认密码
          options: {
            data: {
              username: username,
              phone: phone
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // 注册成功，现在登录
        const { error: signInError } = await supabase.auth.signInWithPassword({
          phone: phone,
          password: "default-password",
        });
        
        if (signInError) throw signInError;
      } else if (error) {
        throw error;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('注册/登录错误:', error);
      
      // 处理各种错误情况
      if (error.message && error.message.includes('phone number format is invalid')) {
        setError('手机号码格式无效，请使用国际格式，例如 +86XXXXXXXXXX');
      } else if (error.message && error.message.includes('JWT')) {
        setError('授权错误，请稍后再试');
      } else if (error.message && error.message.includes('Phone sign-ins are disabled')) {
        setError('手机号码登录功能已被禁用。请联系系统管理员启用此功能。');
      } else {
        setError(error.message || '注册过程中发生错误');
      }
    } finally {
      setLoading(false);
    }
  }

  // 尝试默认用户登录方式
  const handleDefaultUserLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });
      
      if (error) {
        // 如果默认用户不存在，创建一个
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              username: '测试用户'
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // 尝试再次登录
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123',
        });
        
        if (retryError) throw retryError;
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('测试用户登录错误:', error);
      setError('无法使用测试账号登录: ' + error.message);
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
            注册成功！正在重定向到仪表板...
          </div>
        )}
        
        <form onSubmit={handlePhoneSignup} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              手机号
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input w-full"
              placeholder="请输入您的手机号（如 +8613800138000）"
            />
          </div>
          
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
            {loading ? '加载中...' : '手机号注册/登录'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">或者</p>
          <button 
            onClick={handleDefaultUserLogin}
            className="btn btn-secondary w-full mt-2"
            disabled={loading}
          >
            使用测试账号登录
          </button>
        </div>
        
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
