import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rbmgzryxrtdnpqizxgob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibWd6cnl4cnRkbnBxaXp4Z29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDY3MzgsImV4cCI6MjA5NjA4MjczOH0.-p8xJ_DOqoqzynian8rTHJqVZi2ZfZF4CAE-wzw2opo'
)

export default function App() {
  const [user, setUser] = useState(null)

  // 🔄 Load session + listen changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 🔐 Google Login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ======================
  // 🔒 LOGIN PAGE
  // ======================
  if (!user) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4">

        {/* 🌌 SPACE VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/space.mp4" type="video/mp4" />
        </video>

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* LOGIN CARD */}
        <div className="relative z-10 glass w-full max-w-md p-10 rounded-3xl text-center">

          <h1 className="glow-title text-5xl font-bold mb-3">
            StarGate VPN
          </h1>

          <p className="text-cyan-300 mb-8">
            Secure Quantum Access Portal
          </p>

          <button
            onClick={loginWithGoogle}
            className="btn-glow w-full py-4 rounded-xl font-semibold text-lg"
          >
            Continue with Google
          </button>

          <p className="text-gray-400 text-xs mt-6">
            Only Google accounts are allowed
          </p>

        </div>
      </div>
    )
  }

  // ======================
  // 🌌 DASHBOARD PAGE
  // ======================
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4">

      {/* 🌌 SPACE VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/space.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* DASHBOARD CARD */}
      <div className="relative z-10 glass w-full max-w-lg p-10 rounded-3xl">

        <h2 className="glow-title text-3xl mb-6 text-center">
          StarGate Control Panel
        </h2>

        <div className="text-gray-300 text-sm space-y-2 mb-6">
          <p>⚡ Secure tunnel: ACTIVE</p>
          <p>🔐 User: {user.email}</p>
          <p>🌌 Encryption: QUANTUM-LEVEL</p>
        </div>

        <button className="btn-glow w-full py-4 rounded-xl mb-4">
          Download VPN Config
        </button>

        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-red-500/80 hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>
    </div>
  )
}