'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabase()

  const handleSimpleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    if (!username.trim()) {
      setError('用户名不能为空')
      setLoading(false)
      return
    }

    if (!password.trim() || password.length < 6) {
      setError('密码不能为空且至少需要6个字符')
      setLoading(false)
      return
    }

    try {
      // 尝试注册 - 使用固定邮箱前缀和用户提供的用户名
      // 添加随机字符串确保每个用户邮箱都是唯一的
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(2, 10);
      const email = `${username}_${timestamp}_${randomString}@example.com`;
      
      console.log('开始注册请求：', { email, password });
      
      // 检查当前登录会话
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('当前会话状态：', sessionData);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 禁用邮件确认，不需要emailRedirectTo
          emailRedirectTo: null,
          data: {
            username
          }
        }
      });
      
      console.log('注册响应：', { data, error: signUpError });
      
      if (signUpError) {
        console.log('注册错误:', signUpError);
        
        // 如果用户已存在，尝试直接登录
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('User already registered')) {
          console.log('用户已存在，尝试登录...');
          
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.log('登录错误:', signInError);
            throw signInError;
          }
        } else if (signUpError.message.includes('sending confirmation mail')) {
          // 邮件发送错误时，我们知道用户已经创建，所以尝试直接登录
          console.log('邮件发送错误，尝试直接登录...');
          
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.log('登录错误:', signInError);
            throw signInError;
          }
        } else {
          throw signUpError;
        }
      }
      
      console.log('注册/登录成功');
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('注册/登录错误:', error);
      
      // 改进错误处理
      if (error.message && error.message.includes('Database error')) {
        setError('数据库错误，请联系管理员。尝试使用备选登录方式。');
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        // 这里不应该再出现"账号已存在"的错误，因为我们现在使用唯一邮箱
        setError('登录失败，请检查您的用户名和密码。');
      } else if (error.message && error.message.includes('JWT')) {
        setError('JWT验证错误，请检查服务器配置。');
      } else if (error.message && error.message.includes('already registered')) {
        // 处理注册时可能遇到的"已经注册"错误
        setError('系统错误，请尝试使用不同的用户名或联系管理员。');
      } else {
        setError(error.message || '未知错误');
      }
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6 text-center">注册/登录</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            成功！正在重定向到仪表板...
          </div>
        )}
        
        <form onSubmit={handleSimpleRegister} className="space-y-4">
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
              className="w-full p-2 border rounded"
              placeholder="请输入用户名"
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
              placeholder="请输入密码"
            />
          </div>
          
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading || success}
          >
            {loading ? '处理中...' : '注册/登录'}
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
      </div>
    </div>
  )
}
