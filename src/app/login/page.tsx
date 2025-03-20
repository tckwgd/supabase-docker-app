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
      // 尝试登录
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

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
      
      // 错误处理
      if (error.message && error.message.includes('Email not confirmed')) {
        // 由于禁用了邮件确认，这种情况应该不会出现，但仍保留处理
        setError('邮箱未验证。请联系管理员启用您的账号。');
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        setError('用户名或密码不正确。请检查信息或尝试注册。');
      } else if (error.message && error.message.includes('JWT')) {
        setError('JWT 验证错误，服务器配置问题。');
      } else if (error.message && error.message.includes('Database error')) {
        setError('数据库错误，请尝试测试账号登录。');
      } else if (error.message && error.message.includes('already registered')) {
        setError('系统错误，请尝试使用不同的用户名或联系管理员。');
      } else {
        setError(`登录错误: ${error.message || '未知错误'}`);
      }
    } finally {
      setLoading(false)
    }
  }
  
  // 测试账号登录
  const handleTestLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // 使用确定的测试账号
      const { error } = await supabase.auth.signInWithPassword({
        email: 'testuser@example.com',
        password: 'testuser123',
      });
      
      if (error) {
        // 如果用户不存在，创建一个
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'testuser@example.com',
            password: 'testuser123',
            options: {
              emailRedirectTo: null,
              data: {
                username: 'testuser'
              }
            }
          });
          
          if (signUpError) {
            // 如果是邮件发送错误，我们知道用户已经创建，所以尝试直接登录
            if (signUpError.message.includes('sending confirmation mail')) {
              console.log('测试账号邮件发送错误，尝试直接登录...');
            } else if (signUpError.message.includes('already registered')) {
              console.log('测试用户已存在，尝试登录...');
              // 就算我们知道用户已经存在，也继续尝试登录
            } else {
              throw signUpError;
            }
          }
          
          // 尝试再次登录
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: 'testuser@example.com',
            password: 'testuser123',
          });
          
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
      
      // 登录成功
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error: any) {
      console.error('测试账号登录错误:', error);
      setError(`测试账号登录失败: ${error.message}`);
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
          <p className="text-sm text-gray-700">或者</p>
          <button 
            onClick={handleTestLogin}
            className="w-full p-2 mt-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={loading || success}
          >
            使用测试账号登录
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
