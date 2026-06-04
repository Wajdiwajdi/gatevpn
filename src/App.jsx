import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rbmgzryxrtdnpqizxgob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibWd6cnl4cnRkbnBxaXp4Z29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDY3MzgsImV4cCI6MjA5NjA4MjczOH0.-p8xJ_DOqoqzynian8rTHJqVZi2ZfZF4CAE-wzw2opo'
)

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ---------------- SESSION CHECK ----------------
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // ---------------- GOOGLE LOGIN ----------------
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      console.log(error.message)
    }
  }

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  // ---------------- LOGIN SCREEN ----------------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

        {/* BACKGROUND VIDEO */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/space.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/70"></div>

        {/* LOGIN CARD */}
        <div className="relative z-10 glass p-10 rounded-3xl text-center max-w-md w-full">

          <h1 className="glow-title text-5xl mb-4">
            StarGate VPN
          </h1>

          <p className="text-cyan-300 mb-8">
            Secure Space Tunnel Access
          </p>

          <button
            onClick={signInWithGoogle}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition w-full"
          >
            Continue with Google
          </button>

          <p className="text-gray-400 text-sm mt-4">
            Only Google accounts are supported
          </p>

        </div>
      </div>
    )
  }

  // ---------------- DASHBOARD ----------------
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/space.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/80"></div>

      {/* DASHBOARD CARD */}
      <div className="relative z-10 glass p-10 rounded-3xl text-center w-full max-w-md">

        {/* USER INFO */}
        <img
          src={user.user_metadata?.avatar_url}
          className="w-20 h-20 rounded-full mx-auto mb-4 border border-cyan-400"
        />

        <h2 className="text-xl text-white mb-2">
          Welcome
        </h2>

        <p className="text-cyan-300 mb-6">
          {user.email}
        </p>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-white w-full"
        >
          Logout
        </button>

      </div>
    </div>
  )
}