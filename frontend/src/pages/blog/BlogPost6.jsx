import { Link } from 'react-router-dom'
import { ArrowLeft, Star, Zap, Shield, BarChart3, Users, BookOpen } from 'lucide-react'

export default function BlogPost6() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <Link
        to="/blog"
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Blog</span>
      </Link>

      <article className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-amber-400 font-semibold">Updates</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-400">December 15, 2023</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Year in Review: 2023 Platform Updates
          </h1>
          <p className="text-xl text-slate-400">
            A look back at all the new features and improvements we shipped in 2023 to make EduManage even better.
          </p>
        </div>

        <div className="prose prose-lg prose-invert max-w-none">
          <div className="card mb-8">
            <p className="text-slate-300 leading-relaxed">
              2023 has been an incredible year for EduManage. We've listened to your feedback, worked tirelessly, and delivered dozens of new features and improvements. Here's a comprehensive look at everything we've accomplished together.
            </p>
          </div>

          <div className="card mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Q1 2023 Updates</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Performance Improvements</h3>
                  <p className="text-slate-300">Reduced page load times by 60% through code optimization and caching improvements.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Bulk Student Import</h3>
                  <p className="text-slate-300">New CSV import feature allows adding hundreds of students at once.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Enhanced Security</h3>
                  <p className="text-slate-300">Implemented two-factor authentication and advanced encryption.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Q2 2023 Updates</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Dashboard</h3>
                  <p className="text-slate-300">New visualizations for enrollment trends, attendance patterns, and grade distributions.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Course Management Overhaul</h3>
                  <p className="text-slate-300">Redesigned course creation with templates, prerequisites, and capacity management.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Mobile App Launch</h3>
                  <p className="text-slate-300">Released iOS and Android apps for students and faculty on the go.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Q3 2023 Updates</h2>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Parent Portal:</strong> Dedicated access for parents to track their children's progress</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Automated Report Cards:</strong> Generate and distribute report cards automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Email Notifications:</strong> Customizable alerts for grades, attendance, and announcements</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Integration Marketplace:</strong> Connect with popular tools like Google Classroom and Zoom</span>
              </li>
            </ul>
          </div>

          <div className="card mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Q4 2023 Updates</h2>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">AI-Powered Insights:</strong> Smart recommendations for at-risk student interventions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Custom Fields:</strong> Add institution-specific data fields to records</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Advanced Reporting:</strong> Build custom reports with drag-and-drop interface</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">API v2:</strong> Completely redesigned API with webhooks and better documentation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">✓</span>
                <span className="text-slate-300"><strong className="text-white">Dark Mode:</strong> New dark theme across the entire platform</span>
              </li>
            </ul>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">By the Numbers</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-slate-950/50 rounded-lg">
                <div className="text-4xl font-bold text-amber-400 mb-2">87</div>
                <div className="text-sm text-slate-400">Features Released</div>
              </div>
              <div className="text-center p-4 bg-slate-950/50 rounded-lg">
                <div className="text-4xl font-bold text-amber-400 mb-2">250+</div>
                <div className="text-sm text-slate-400">Bug Fixes</div>
              </div>
              <div className="text-center p-4 bg-slate-950/50 rounded-lg">
                <div className="text-4xl font-bold text-amber-400 mb-2">99.9%</div>
                <div className="text-sm text-slate-400">Uptime</div>
              </div>
              <div className="text-center p-4 bg-slate-950/50 rounded-lg">
                <div className="text-4xl font-bold text-amber-400 mb-2">2.5M+</div>
                <div className="text-sm text-slate-400">Students Managed</div>
              </div>
            </div>
          </div>

          <div className="card bg-amber-500/10 border-amber-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              None of this would have been possible without our amazing community of educators, administrators, and students who provide invaluable feedback and suggestions.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We're excited for what 2024 has in store. Stay tuned for even more innovations as we continue our mission to transform education management!
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}
