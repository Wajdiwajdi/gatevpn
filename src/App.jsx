import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rbmgzryxrtdnpqizxgob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJibWd6cnl4cnRkbnBxaXp4Z29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDY3MzgsImV4cCI6MjA5NjA4MjczOH0.-p8xJ_DOqoqzynian8rTHJqVZi2ZfZF4CAE-wzw2opo'
)

// ======================
// 🔐 LOGIN PAGE
// ======================
function Login() {
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

      {/* SPACE BACKGROUND */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/space.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 glass p-10 rounded-3xl text-center max-w-md w-full">

        <h1 className="glow-title text-5xl mb-3">
          StarGate VPN
        </h1>

        <p className="text-cyan-300 mb-2">
          Secure Quantum Tunnel Access
        </p>

        <p className="text-gray-400 text-sm mb-8">
          Connect to your private encrypted gateway in seconds
        </p>

        <button
          onClick={loginWithGoogle}
          className="btn-glow w-full py-4 rounded-xl"
        >
          Continue with Google
        </button>

        <p className="text-gray-500 text-xs mt-6">
          Only verified Google accounts can access the network
        </p>

      </div>
    </div>
  )
}


// ======================
// 🌌 DASHBOARD
// ======================
function Dashboard({ user, onLogout }) {
  const [configFile, setConfigFile] = useState(null)
  const [message, setMessage] = useState('')

  // ======================
  // ASSIGN VPN (silent)
  // ======================
  const assignVpn = async () => {
    await supabase.rpc('sync_vpn_pool')

    const { data: existing } = await supabase
      .from('vpn_users')
      .select('config_file')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      setConfigFile(existing.config_file)
      return
    }

    const { data, error } = await supabase.rpc('assign_vpn_config', {
      uid: user.id
    })

    if (error || data === 'NO_FILES') {
      setMessage('⚠️ No VPN servers available right now')
      return
    }

    setConfigFile(data)
    setMessage('') // no annoying assignment message anymore
  }

  // ======================
  // DOWNLOAD CONFIG
  // ======================
  const downloadConfig = async () => {
    if (!configFile) {
      setMessage('No configuration assigned yet')
      return
    }

    const { data, error } = await supabase.storage
      .from('vpn-configs')
      .download(configFile)

    if (error || !data) {
      setMessage('Unable to retrieve VPN config file')
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

    setMessage('Secure tunnel file downloaded successfully 🚀')
  }

  useEffect(() => {
    assignVpn()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* BACKGROUND */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="/space.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70"></div>

      {/* CARD */}
      <div className="relative z-10 glass p-10 rounded-3xl max-w-lg w-full">

        <h2 className="glow-title text-3xl mb-4 text-center">
          StarGate Control Panel
        </h2>

        <p className="text-gray-300 text-sm mb-2">
          Welcome, {user.email}
        </p>

        <p className="text-cyan-300 text-xs mb-6">
          Your encrypted tunnel is ready. Download your configuration below.
        </p>

        {/* DOWNLOAD */}
        <button
          onClick={downloadConfig}
          className="btn-glow w-full py-4 rounded-xl mb-4"
        >
          Download WireGuard Config
        </button>

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-cyan-300 text-sm mb-4">
            {message}
          </p>
        )}

        {/* ======================
            📘 GUIDE SECTION
        ====================== */}
        <div className="bg-black/30 p-4 rounded-xl text-sm text-gray-300 space-y-2 mb-6">

          <h3 className="text-cyan-300 font-semibold">
            📘 How to use WireGuard
          </h3>

          <p>1. Install WireGuard app on your device (Windows / Android / iOS / Linux)</p>

          <p>2. Open WireGuard and click <b>“Import tunnel”</b></p>

          <p>3. Select the downloaded <b>stargate-vpn.conf</b> file</p>

          <p>4. Activate the tunnel switch</p>

          <p>5. You are now connected to the StarGate network 🚀</p>

        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="w-full bg-red-500/80 hover:bg-red-600 py-3 rounded-xl transition"
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
