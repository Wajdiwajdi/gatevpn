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
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4">

  {/* 🌌 SPACE VIDEO BACKGROUND */}
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/space.mp4" type="video/mp4" />
  </video>

  {/* DARK SPACE OVERLAY */}
  <div className="absolute inset-0 bg-black/60"></div>

  {/* LOGIN CARD */}
  <div className="relative z-10 glass w-full max-w-md p-10 rounded-3xl text-center">

    <h1 className="glow-title text-5xl font-bold mb-2">
      StarGate VPN
    </h1>

    <p className="text-cyan-300 mb-8">
      Enter the Quantum Tunnel
    </p>

    <input
      className="input-field w-full p-4 rounded-xl mb-4 text-white"
      placeholder="Email"
    />

    <input
      className="input-field w-full p-4 rounded-xl mb-6 text-white"
      placeholder="Password"
      type="password"
    />

    <button className="btn-glow w-full py-4 rounded-xl font-semibold">
      Continue
    </button>

    <p className="text-gray-400 text-xs mt-4">
      Secure encrypted access to StarGate network
    </p>

  </div>
</div>
    )
  }

  // ---------------- DASHBOARD ----------------
  return (
  <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4">

  {/* 🌌 SPACE VIDEO BACKGROUND */}
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

    <div className="space-y-3 text-gray-300 mb-6 text-sm">
      <p>⚡ Quantum encrypted tunnel active</p>
      <p>🌌 Secure routing enabled</p>
      <p>🔐 Identity verified via Supabase</p>
    </div>

    <button className="btn-glow w-full py-4 rounded-xl mb-4">
      Download VPN Config
    </button>

    <button className="w-full py-4 rounded-xl bg-red-500/80 hover:bg-red-600 transition">
      Disconnect
    </button>

  </div>
</div>
  )
}
