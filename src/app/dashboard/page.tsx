'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

// Define a type for our todo items
interface Todo {
  id: number
  title: string
  completed: boolean
  created_at: string
  user_id: string
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
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
      await fetchTodos(user.id)
    }
    
    getUser()
  }, [router, supabase])

  // Fetch todos from Supabase
  const fetchTodos = async (userId: string) => {
    try {
      setLoading(true)
      
      // Query todos table for the current user
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setTodos(data || [])
    } catch (error: any) {
      setError(error.message || 'Error fetching todos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Add a new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTodo.trim() || !user) return
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          { title: newTodo, user_id: user.id }
        ])
        .select()
      
      if (error) throw error
      
      // Refresh the todo list
      await fetchTodos(user.id)
      setNewTodo('')
    } catch (error: any) {
      setError(error.message || 'Error adding todo')
      console.error(error)
    }
  }

  // Toggle todo completion status
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)
      
      if (error) throw error
      
      // Update state locally for immediate UI update
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ))
    } catch (error: any) {
      setError(error.message || 'Error updating todo')
      console.error(error)
    }
  }

  // Delete a todo
  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Update state locally for immediate UI update
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error: any) {
      setError(error.message || 'Error deleting todo')
      console.error(error)
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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Add New Todo</h2>
          <form onSubmit={addTodo} className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="input flex-grow"
              placeholder="Enter a new task..."
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!newTodo.trim()}
            >
              Add
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">Your Todos</h2>
          
          {loading ? (
            <p className="text-center py-4">Loading todos...</p>
          ) : todos.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li 
                  key={todo.id} 
                  className="p-3 bg-gray-50 rounded border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                      className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
