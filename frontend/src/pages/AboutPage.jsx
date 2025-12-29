import { Link } from 'react-router-dom'
import { ArrowLeft, Target, Users, Award, Globe } from 'lucide-react'

export default function AboutPage() {
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

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent leading-tight pb-2">
          About EduManage
        </h1>
        
        <div className="space-y-8 text-slate-300">
          <section className="card">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-lg leading-relaxed">
              EduManage is dedicated to transforming education management through innovative technology. 
              We believe that efficient administration enables educators to focus on what matters most: 
              teaching and nurturing student success.
            </p>
          </section>

          <section className="card">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            </div>
            <p className="text-lg leading-relaxed">
              To become the world's most trusted student management platform, empowering educational 
              institutions of all sizes to deliver exceptional learning experiences through seamless 
              administration and data-driven insights.
            </p>
          </section>

          <section className="card">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Our Team</h2>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              We are a passionate team of educators, developers, and innovators committed to making 
              education management simpler and more effective. Our diverse backgrounds in technology 
              and education give us unique insights into the challenges institutions face.
            </p>
          </section>

          <section className="card">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Global Impact</h2>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">500+</div>
                <div className="text-sm text-slate-400">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">50K+</div>
                <div className="text-sm text-slate-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">45+</div>
                <div className="text-sm text-slate-400">Countries</div>
              </div>
            </div>
            <p className="text-lg leading-relaxed">
              Trusted by educational institutions worldwide, from small schools to large universities, 
              EduManage is making a difference in how education is managed globally.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
