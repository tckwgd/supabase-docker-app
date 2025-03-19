'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabase()

  // Check if user is authenticated
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      setEmail(user.email || '')
      setLoading(false)
    }
    
    getUser()
  }, [router, supabase])

  // Handle password reset
  const handleResetPassword = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      })
      
      if (error) throw error
      
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      setError(error.message || 'Error sending password reset email')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // If still loading or no user, show loading state
  if (loading && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="card w-full max-w-lg">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">User Information</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input w-full bg-gray-50"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="input w-full bg-gray-50"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Sign In
            </label>
            <input
              type="text"
              value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              disabled
              className="input w-full bg-gray-50"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Security</h2>
          
          <button
            onClick={handleResetPassword}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
          
          <p className="mt-2 text-sm text-gray-500">
            You will receive an email with a link to reset your password.
          </p>
        </div>
      </div>
    </div>
  )
}
