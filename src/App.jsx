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
  // AUTH INIT
  // ======================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const u = data.session?.user ?? null
      setUser(u)

      if (u) await assignVpn(u)
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)

        if (u) await assignVpn(u)
      })

    return () => subscription.unsubscribe()
  }, [])

  // ======================
  // GOOGLE LOGIN
  // ======================
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
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
  // AUTO SYNC + ASSIGN
  // ======================
  const assignVpn = async (user) => {
    if (!user) return

    // 1. sync storage → pool
    await supabase.rpc('sync_vpn_pool')

    // 2. check if already assigned
    const { data: existing } = await supabase
      .from('vpn_users')
      .select('config_file')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) return

    // 3. assign file
    const { data, error } = await supabase.rpc('assign_vpn_config', {
      uid: user.id
    })

    if (error) {
      console.log(error)
      setMessage('Assignment error')
      return
    }

    if (data === 'NO_FILES') {
      setMessage('⚠️ No VPN configs available')
      return
    }

    setMessage('🚀 Assigned: ' + data)
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
      setMessage('No config assigned')
      return
    }

    const { data: file, error: dlError } = await supabase.storage
      .from('vpn-configs')
      .download(data.config_file)

    if (dlError || !file) {
      setMessage('File missing in storage')
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
  // LOGIN UI
  // ======================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/space.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 glass p-10 rounded-3xl text-center max-w-md w-full">

          <h1 className="glow-title text-5xl mb-3">StarGate VPN</h1>

          <p className="text-cyan-300 mb-8">
            Quantum Secure Access
          </p>

          <button
            onClick={loginWithGoogle}
            className="btn-glow w-full py-4 rounded-xl"
          >
            Continue with Google
          </button>

        </div>
      </div>
    )
  }

  // ======================
  // DASHBOARD
  // ======================
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/space.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70"></div>

      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full">

        <h2 className="glow-title text-3xl mb-6 text-center">
          Control Panel
        </h2>

        <p className="text-gray-300 mb-4">
          User: {user.email}
        </p>

        <button
          onClick={downloadConfig}
          className="btn-glow w-full py-4 rounded-xl mb-4"
        >
          Download VPN Config
        </button>

        {message && (
          <p className="text-cyan-300 text-center mb-3 text-sm">
            {message}
          </p>
        )}

        <button
          onClick={logout}
          className="w-full bg-red-500 py-3 rounded-xl"
        >
          Logout
        </button>

      </div>
    </div>
  )
}
