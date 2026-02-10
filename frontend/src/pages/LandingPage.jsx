import { Link } from 'react-router-dom'
import { GraduationCap, Users, BookOpen, Award, BarChart3, Shield, Zap, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              EduManage
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              state={{ openRegister: true }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium shadow-lg shadow-amber-500/30 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
                ✨ The Future of Education Management
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Elevate Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              Experience premium student management with our sophisticated platform. 
              Streamline operations, enhance collaboration, and unlock unprecedented insights.
            </p>
            <div className="flex justify-center">
              <Link
                to="/login"
                state={{ openRegister: true }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold shadow-2xl shadow-amber-500/40 transition-all transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '50K+', label: 'Active Students' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '500+', label: 'Institutions' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Premium Features
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to manage your institution with excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Student Management',
                description: 'Comprehensive profiles with academic history, attendance tracking, and performance analytics.',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: BookOpen,
                title: 'Course Administration',
                description: 'Effortlessly manage courses, schedules, and curriculum with our intuitive interface.',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: Award,
                title: 'Grade Management',
                description: 'Streamlined grading system with automated calculations and instant reporting.',
                gradient: 'from-amber-500 to-amber-600'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Real-time insights and comprehensive reports to drive data-informed decisions.',
                gradient: 'from-green-500 to-green-600'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level encryption with OAuth 2.0 authentication and role-based access control.',
                gradient: 'from-red-500 to-red-600'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized performance with instant search and real-time updates across all modules.',
                gradient: 'from-yellow-500 to-yellow-600'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-${feature.gradient.split('-')[1]}-500/50 transition-all`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Why Leading Institutions Choose Us
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Seamless Integration',
                    description: 'Connect with existing systems effortlessly. Our platform adapts to your workflow.'
                  },
                  {
                    title: 'Scalable Architecture',
                    description: 'From small schools to large universities, our system grows with your institution.'
                  },
                  {
                    title: 'Expert Support',
                    description: 'Dedicated support team available 24/7 to ensure your success every step of the way.'
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                      <p className="text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
                <Globe className="w-24 h-24 text-amber-400 mb-8 mx-auto" />
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-4">
                    99.9%
                  </div>
                  <div className="text-xl text-white font-semibold mb-2">Uptime Guarantee</div>
                  <div className="text-slate-400">
                    Enterprise-grade reliability you can count on
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 rounded-3xl p-12 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Transform Your Institution?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of institutions worldwide using EduManage
              </p>
              <Link
                to="/login"
                className="inline-block px-10 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  EduManage
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Premium Student Management System for modern institutions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/features" className="hover:text-amber-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-amber-400 transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-amber-400 transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-amber-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/help" className="hover:text-amber-400 transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
                <li><Link to="/api-docs" className="hover:text-amber-400 transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 EduManage. All rights reserved.
            </p>
            <div className="flex gap-6 text-slate-400 text-sm">
              <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms</Link>
              <Link to="/cookies" className="hover:text-amber-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
