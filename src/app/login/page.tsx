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
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabase()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('开始登录请求:', { email, password });
      
      // 检查当前会话状态
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('当前会话状态:', sessionData);
      
      // 尝试登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('登录响应:', { data, error });

      if (error) {
        throw error;
      }
      
      // 登录成功
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error('登录错误:', error);
      
      if (error.message && error.message.includes('Email not confirmed')) {
        // 由于禁用了邮件确认，这种情况应该不会出现，但仍保留处理
        setError('邮箱未验证。请联系管理员启用您的账号。');
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        setError('用户名或密码不正确。请检查信息或尝试注册。');
      } else if (error.message && error.message.includes('JWT')) {
        setError('JWT 验证错误，服务器配置问题。');
      } else if (error.message && error.message.includes('Database error')) {
        setError('数据库错误，请尝试备选登录方式。');
      } else if (error.message && error.message.includes('already registered')) {
        setError('系统错误，请尝试使用不同的用户名或联系管理员。');
      } else {
        setError(`登录错误: ${error.message || '未知错误'}`);
      }
    } finally {
      setLoading(false)
    }
  }
  
  // 添加匿名登录功能
  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('尝试匿名登录...');
      
      // 尝试匿名登录
      const { data, error } = await supabase.auth.signInAnonymously();
      
      console.log('匿名登录响应:', { data, error });
      
      if (error) throw error;
      
      // 登录成功
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error('匿名登录错误:', error);
      setError('匿名登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  // 添加电话登录功能
  const handlePhoneLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const phone = prompt('请输入你的手机号码（包含国家代码，如+86123456789）:');
      
      if (!phone) {
        setError('需要手机号码才能继续');
        setLoading(false);
        return;
      }
      
      console.log('尝试手机登录...', phone);
      
      // 尝试发送OTP
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      console.log('手机登录响应:', { data, error });
      
      if (error) throw error;
      
      // 提示用户输入OTP
      const otp = prompt('我们已经发送了验证码到你的手机。\n请输入收到的验证码:');
      
      if (!otp) {
        setError('需要验证码才能登录');
        setLoading(false);
        return;
      }
      
      // 验证OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });
      
      if (verifyError) throw verifyError;
      
      // 登录成功
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error('手机登录错误:', error);
      setError('手机登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="card w-full max-w-md p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            登录成功！正在重定向...
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              placeholder="请输入您的密码"
            />
          </div>
          
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading || success}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">或者使用其他方式</p>
          <button 
            onClick={handleAnonymousLogin}
            className="w-full p-2 mt-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={loading || success}
          >
            使用匿名账号登录
          </button>
          
          <button 
            onClick={handlePhoneLogin}
            className="w-full p-2 mt-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={loading || success}
          >
            使用手机号码登录
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            没有账号？{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              点此注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
