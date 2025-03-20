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
        setError('数据库错误，请联系管理员。尝试使用测试账号登录。');
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        // 这里不应该再出现“账号已存在”的错误，因为我们现在使用唯一邮箱
        setError('登录失败，请检查您的用户名和密码。');
      } else if (error.message && error.message.includes('JWT')) {
        setError('JWT验证错误，请检查服务器配置。');
      } else if (error.message && error.message.includes('already registered')) {
        // 处理注册时可能遇到的“已经注册”错误
        setError('系统错误，请尝试使用不同的用户名或联系管理员。');
      } else {
        setError(error.message || '未知错误');
      }
    } finally {
      setLoading(false);
    }
  }

  // 测试账号登录
  const handleTestLogin = async () => {
    setLoading(true);
    setError(null);
    
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
      }, 1000);
    } catch (error: any) {
      console.error('测试账号登录错误:', error);
      setError('测试账号登录失败: ' + error.message);
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
          <p className="text-sm text-gray-700">或者</p>
          <button 
            onClick={handleTestLogin}
            className="w-full p-2 mt-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={loading || success}
          >
            使用测试账号登录
          </button>
        </div>
      </div>
    </div>
  )
}
