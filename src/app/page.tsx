import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="card w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Supabase Docker App</h1>
          <p className="text-gray-600">
            A Next.js application connected to a self-hosted Supabase instance using Docker
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link 
            href="/login" 
            className="btn btn-primary w-full text-center"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="btn btn-secondary w-full text-center"
          >
            Register
          </Link>
        </div>

        <div className="text-center text-gray-500 text-sm pt-4">
          <p>Check out the <Link href="/dashboard" className="text-emerald-600 hover:underline">Dashboard</Link> to see your data</p>
        </div>
      </div>
    </main>
  )
}
