import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rbmgzryxrtdnpqizxgob.supabase.co',
  'YOUR_ANON_KEY'
)


// ======================
// 🔐 LOGIN PAGE
// ======================
function Login({ onLogin }) {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/space.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 glass p-10 rounded-3xl text-center max-w-md w-full">

        <h1 className="glow-title text-5xl mb-3">StarGate VPN</h1>

        <p className="text-cyan-300 mb-8">
          Secure Quantum Access Portal
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
// 🌌 DASHBOARD
// ======================
function Dashboard({ user, onLogout }) {
  const [message, setMessage] = useState('')
  const [configFile, setConfigFile] = useState(null)

  // ======================
  // ASSIGN VPN
  // ======================
  const assignVpn = async () => {
    if (!user) return

    // sync pool from storage
    await supabase.rpc('sync_vpn_pool')

    // check existing
    const { data: existing } = await supabase
      .from('vpn_users')
      .select('config_file')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      setConfigFile(existing.config_file)
      return
    }

    // assign new
    const { data, error } = await supabase.rpc('assign_vpn_config', {
      uid: user.id
    })

    if (error) {
      console.log(error)
      setMessage('Assignment error')
      return
    }

    if (data === 'NO_FILES') {
      setMessage('No VPN configs available')
      return
    }

    setConfigFile(data)
    setMessage('VPN Assigned: ' + data)
  }

  // ======================
  // DOWNLOAD
  // ======================
  const downloadConfig = async () => {
    if (!configFile) {
      setMessage('No config assigned yet')
      return
    }

    console.log("Downloading file:", configFile)

    const { data, error } = await supabase.storage
      .from('vpn-configs')
      .download(configFile)

    if (error || !data) {
      console.log("Storage error:", error)
      setMessage('File not found in storage: ' + configFile)
      return
    }

    const text = await data.text()

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'stargate-vpn.conf'
    a.click()

    URL.revokeObjectURL(url)

    setMessage('Download started 🚀')
  }

  // auto assign on load
  useEffect(() => {
    assignVpn()
  }, [])

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

        <p className="text-gray-300 mb-3">
          User: {user.email}
        </p>

        {configFile && (
          <p className="text-cyan-300 text-sm mb-3">
            Assigned file: {configFile}
          </p>
        )}

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
          onClick={onLogout}
          className="w-full bg-red-500 py-3 rounded-xl"
        >
          Logout
        </button>

      </div>
    </div>
  )
}


// ======================
// MAIN APP
// ======================
export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    init()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null)
      })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return user ? (
    <Dashboard user={user} onLogout={logout} />
  ) : (
    <Login />
  )
}
