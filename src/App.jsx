import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rbmgzryxrtdnpqizxgob.supabase.co',
  'YOUR_ANON_KEY_HERE'
)

export default function App() {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // 🔄 session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null)
      })

    return () => subscription.unsubscribe()
  }, [])

  // 🔐 Google login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  // 🚪 logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // 📥 DOWNLOAD CONFIG (FIXED)
  const downloadConfig = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('vpn_users')
      .select('config_file')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      setMessage('No VPN config assigned')
      setMessageType('error')
      return
    }

    const { data: file, error: dlError } = await supabase.storage
      .from('vpn-configs')
      .download(data.config_file)

    if (dlError || !file) {
      setMessage('File not found')
      setMessageType('error')
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

    setMessage('Download started 🚀')
    setMessageType('success')
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
            Only Google accounts are allowed
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
          <p>⚡ Secure tunnel: ACTIVE</p>
          <p>🔐 User: {user.email}</p>
          <p>🌌 Encryption: QUANTUM-LEVEL</p>
        </div>

        <button
          onClick={downloadConfig}
          className="btn-glow w-full py-4 rounded-xl mb-4"
        >
          Download VPN Config
        </button>

        {message && (
          <p className="text-center text-sm mb-3 text-cyan-300">
            {message}
          </p>
        )}

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
