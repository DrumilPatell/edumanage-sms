import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import { GraduationCap, ArrowLeft, Mail, Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('login') // 'login', 'register'
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (location.state?.openRegister) {
      setActiveTab('register')
    }
  }, [location.state])

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student'
  })

  const handleOAuthLogin = async (provider) => {
    setLoading(true)
    setError(null)

    try {

      localStorage.removeItem('auth-storage')
      console.log('Cleared local auth-storage before OAuth')

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/${provider}/login`)
      
      if (!response.ok) {
        throw new Error('Failed to get OAuth URL')
      }
      
      const data = await response.json()
      
      window.location.href = data.auth_url
      
    } catch (err) {
      console.error('OAuth initiation failed', err)
      setError(err.message || 'Failed to initiate OAuth login')
      setLoading(false)
    }
  }

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Login failed')
      }

      const data = await response.json()

      setAuth(data.user, data.access_token)

      navigate('/dashboard')
      
    } catch (err) {
      console.error('Email/Password login failed', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          role: formData.role
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : (errorData.detail?.msg || errorData.message || 'Registration failed')
        throw new Error(errorMessage)
      }

      const data = await response.json()

      setAuth(data.user, data.access_token)

      navigate('/dashboard')
      
    } catch (err) {
      console.error('Registration failed', err)
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-lg">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Tab */}
          {activeTab === 'login' && (
            <div className="space-y-6">
              {/* OAuth Options */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Sign in with
                </h2>
                
                {/* Google Login */}
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-amber-500/50 transition-all disabled:opacity-50 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Continue with Google</span>
                </button>

                {/* Microsoft Login */}
                <button
                  onClick={() => handleOAuthLogin('microsoft')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-amber-500/50 transition-all disabled:opacity-50 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M0 0h11v11H0z" />
                    <path fill="#81bc06" d="M12 0h11v11H12z" />
                    <path fill="#05a6f0" d="M0 12h11v11H0z" />
                    <path fill="#ffba08" d="M12 12h11v11H12z" />
                  </svg>
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Continue with Microsoft</span>
                </button>

                {/* GitHub Login */}
                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-amber-500/50 transition-all disabled:opacity-50 group"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/50 text-slate-400">Or sign in with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-11 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/30"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              </form>
            </div>
          )}

          {/* Register Tab */}
          {activeTab === 'register' && (
            <div className="space-y-6">
              {/* OAuth Options */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Sign up with
                </h2>
                
                {/* Google Sign Up */}
                <button
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-amber-500/50 transition-all disabled:opacity-50 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Continue with Google</span>
                </button>

                {/* Microsoft Sign Up */}
                <button
                  onClick={() => handleOAuthLogin('microsoft')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-amber-500/50 transition-all disabled:opacity-50 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M0 0h11v11H0z" />
                    <path fill="#81bc06" d="M12 0h11v11H12z" />
                    <path fill="#05a6f0" d="M0 12h11v11H0z" />
                    <path fill="#ffba08" d="M12 12h11v11H12z" />
                  </svg>
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Continue with Microsoft</span>
                </button>

                {/* GitHub Sign Up */}
                <button
                  onClick={() => handleOAuthLogin('github')}
                  disabled={loading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-amber-500/50 transition-all disabled:opacity-50 group"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="font-medium text-slate-300 group-hover:text-white transition-colors">Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/50 text-slate-400">Or create account with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-11 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="Create a password (min 6 chars)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Role
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="student" className="bg-slate-900">Student</option>
                    <option value="faculty" className="bg-slate-900">Faculty</option>
                    <option value="admin" className="bg-slate-900">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/30"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            By signing in, you agree to our <Link to="/terms" state={{ fromLogin: true }} className="text-amber-400 hover:text-amber-300 transition-colors">Terms of Service</Link> and <Link to="/privacy" state={{ fromLogin: true }} className="text-amber-400 hover:text-amber-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

