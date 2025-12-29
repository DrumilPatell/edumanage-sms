import { Link } from 'react-router-dom'
import { ArrowLeft, Code, Zap, Lock, Book } from 'lucide-react'

export default function APIDocsPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/students',
      description: 'Retrieve all students',
      auth: true
    },
    {
      method: 'POST',
      path: '/api/v1/students',
      description: 'Create a new student',
      auth: true
    },
    {
      method: 'GET',
      path: '/api/v1/students/{id}',
      description: 'Get student by ID',
      auth: true
    },
    {
      method: 'PUT',
      path: '/api/v1/students/{id}',
      description: 'Update student information',
      auth: true
    },
    {
      method: 'DELETE',
      path: '/api/v1/students/{id}',
      description: 'Delete a student',
      auth: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Code className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            API Documentation
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Integrate EduManage with your existing systems using our RESTful API
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fast & Reliable</h3>
            <p className="text-slate-400 text-sm">99.9% uptime with low latency responses</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
            <p className="text-slate-400 text-sm">OAuth 2.0 and JWT authentication</p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Book className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Well Documented</h3>
            <p className="text-slate-400 text-sm">Comprehensive guides and examples</p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4">Authentication</h3>
            <p className="text-slate-400 mb-4">
              All API requests require authentication. Include your API key in the Authorization header:
            </p>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-green-400">curl -X GET \</div>
              <div className="text-slate-300 ml-4">https://api.edumanage.com/v1/students \</div>
              <div className="text-slate-300 ml-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">API Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="card">
                <div className="flex items-start gap-4">
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                    endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                    endpoint.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="flex-1">
                    <div className="font-mono text-white mb-2">{endpoint.path}</div>
                    <p className="text-slate-400 text-sm">{endpoint.description}</p>
                    {endpoint.auth && (
                      <div className="flex items-center gap-2 mt-2">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400">Requires authentication</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Need an API Key?</h3>
            <p className="text-slate-400 mb-6">
              API keys are available for Professional and Enterprise plans.
            </p>
            <Link to="/pricing" className="btn-primary inline-block">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
