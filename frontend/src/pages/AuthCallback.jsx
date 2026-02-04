import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token')
        const userEmail = searchParams.get('user')
        
        console.log('AuthCallback: Full URL:', window.location.href)
        console.log('AuthCallback: token length=', token?.length, 'first 20 chars=', token?.substring(0, 20))
        console.log('AuthCallback: user=', userEmail)
        
        if (!token) {
          throw new Error('No token received from authentication')
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
        console.log('AuthCallback: Fetching debug-token from:', `${apiUrl}/auth/debug-token`)
        const dbgResp = await fetch(`${apiUrl}/auth/debug-token?token=${encodeURIComponent(token)}`)
        let dbgJson = null
        try {
          dbgJson = await dbgResp.json()
        } catch (e) {
          console.warn('Failed to parse debug-token response', e)
        }
        console.log('AuthCallback: debug-token response:', dbgJson)
        if (!dbgResp.ok || !(dbgJson && dbgJson.ok)) {
          const detail = dbgJson?.detail || (await dbgResp.text())
          throw new Error(`Token validation failed: ${detail || dbgResp.statusText}`)
        }
        console.log('Fetching user from:', `${apiUrl}/auth/me`)
        console.log('Using token:', token)
        
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('Response status:', response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', errorText)
          // Provide token snippet to help debug with backend logs
          const tokenSnippet = token ? `${token.substring(0, 12)}... (len=${token.length})` : 'no-token'
          throw new Error(`Failed to fetch user details: ${response.status} - ${errorText} | token=${tokenSnippet}`)
        }
        const user = await response.json()
        console.log('User fetched:', user)
        setAuth(user, token)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
      }
    }
    handleCallback()
  }, [searchParams, navigate, setAuth])
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-red-400 text-2xl font-bold mb-4">Authentication Error</div>
          <p className="text-slate-400 mb-6">{error}</p>
          {/* Helpful dev tools */}
          <div className="mt-4">
            <button
              className="btn btn-secondary mr-2"
              onClick={() => {
                localStorage.removeItem('auth-storage')
                window.location.href = '/login'
              }}
            >
              Clear & Retry
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                const token = new URLSearchParams(window.location.search).get('token')
                if (token) navigator.clipboard.writeText(token)
              }}
            >
              Copy Token
            </button>
            <div className="mt-3 flex gap-2 justify-center">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  localStorage.removeItem('auth-storage')
                  const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/google/login`)
                  const data = await resp.json()
                  window.location.href = data.auth_url
                }}
              >
                Auto Retry (Google)
              </button>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  localStorage.removeItem('auth-storage')
                  const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/microsoft/login`)
                  const data = await resp.json()
                  window.location.href = data.auth_url
                }}
              >
                Auto Retry (Microsoft)
              </button>
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  localStorage.removeItem('auth-storage')
                  const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/auth/github/login`)
                  const data = await resp.json()
                  window.location.href = data.auth_url
                }}
              >
                Auto Retry (GitHub)
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
          </div>
        </div>
        <p className="text-slate-300 text-lg font-medium">Completing authentication...</p>
        <p className="text-slate-500 text-sm mt-2">Please wait</p>
      </div>
    </div>
  )
}