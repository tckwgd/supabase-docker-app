'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function NavBar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabase()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
    
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
        }
      )
      
      return () => {
        authListener?.subscription?.unsubscribe?.()
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-emerald-600 px-6 py-4 shadow-md">
      <div className="flex justify-between items-center">
        <Link 
          href="/" 
          className="text-white font-bold text-xl"
        >
          Supabase App
        </Link>
        
        <div className="flex items-center space-x-4">
          {!loading && (
            user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-white hover:text-emerald-200"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="text-white hover:text-emerald-200"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-white hover:text-emerald-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-white hover:text-emerald-200"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white text-emerald-600 px-3 py-1 rounded hover:bg-emerald-100"
                >
                  Register
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
