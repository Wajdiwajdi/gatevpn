import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rbmgzryxrtdnpqizxgob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibWd6cnl4cnRkbnBxaXp4Z29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDY3MzgsImV4cCI6MjA5NjA4MjczOH0.-p8xJ_DOqoqzynian8rTHJqVZi2ZfZF4CAE-wzw2opo'
)

export default function App() {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')

  // ======================
  // AUTH LISTENER
  // ======================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const u = data.session?.user ?? null
      setUser(u)

      if (u) await assignVpnConfig(u)
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)

        if (u) await assignVpnConfig(u)
      })

    return () => subscription.unsubscribe()
  }, [])

  // ======================
  // GOOGLE LOGIN
  // ======================
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('')
  }

  // ======================
  // AUTO ASSIGN VPN CONFIG
  // ======================
  const assignVpnConfig = async (user) => {
    if (!user) return

    // check if already assigned
    const { data: existing } = await supabase
      .from('vpn_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) return

    // get free config
    const { data: pool } = await supabase
      .from('vpn_pool')
      .select('config_file')
      .eq('assigned', false)
      .limit(1)
      .maybeSingle()

    if (!pool) {
      setMessage('⚠️ No VPN configs available')
      return
    }

    // mark as assigned
    await supabase
      .from('vpn_pool')
      .update({ assigned: true })
      .eq('config_file', pool.config_file)

    // assign to user
    await supabase.from('vpn_users').insert({
      user_id: user.id,
      config_file: pool.config_file,
    })

    setMessage('🚀 VPN Config assigned successfully')
  }

  // ======================
  // DOWNLOAD CONFIG
  // ======================
  const downloadConfig = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('vpn_users')
      .select('config_file')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !data) {
      setMessage('No VPN config assigned')
      return
    }

    const { data: file, error: dlError } = await supabase.storage
      .from('vpn-configs')
      .download(data.config_file)

    if (dlError || !file) {
      setMessage('File not found in storage')
      return
    }

    const text = await file.text()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'stargate-vpn.conf'
    a.click()

    URL.revokeObjectURL(url)

    setMessage('📥 Download started')
  }

  // ======================
  // LOGIN PAGE
  // ======================
  if (!user) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4">

        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/space.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60"></div>

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
            Only Google accounts allowed
          </p>

        </div>
      </div>
    )
  }

  // ======================
  // DASHBOARD
  // ======================
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4">

      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/space.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 glass w-full max-w-lg p-10 rounded-3xl">

        <h2 className="glow-title text-3xl mb-6 text-center">
          StarGate Control Panel
        </h2>

        <div className="text-gray-300 text-sm space-y-2 mb-6">
          <p>⚡ Tunnel: ACTIVE</p>
          <p>🔐 User: {user.email}</p>
          <p>🌌 Status: QUANTUM SECURE</p>
        </div>

        <button
          onClick={downloadConfig}
          className="btn-glow w-full py-4 rounded-xl mb-4"
        >
          Download VPN Config
        </button>

        {message && (
          <p className="text-center text-cyan-300 text-sm mb-3">
            {message}
          </p>
        )}

        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-red-500/80 hover:bg-red-600"
        >
          Logout
        </button>

      </div>
    </div>
  )
}
