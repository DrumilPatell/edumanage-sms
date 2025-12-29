import { Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, Users, Heart, Rocket } from 'lucide-react'

export default function CareersPage() {
  const positions = [
    {
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our engineering team to build scalable solutions for education management.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Help shape the future of education technology through intuitive design.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build relationships with educational institutions and ensure their success.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Manage and scale our infrastructure to support growing customer needs.'
    }
  ]

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, dental, and vision coverage'
    },
    {
      icon: Rocket,
      title: 'Growth Opportunities',
      description: 'Professional development budget and learning resources'
    },
    {
      icon: Users,
      title: 'Great Team',
      description: 'Work with passionate people who care about education'
    },
    {
      icon: Briefcase,
      title: 'Work-Life Balance',
      description: 'Flexible hours, remote work options, and unlimited PTO'
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
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Help us transform education management and make a real impact on students worldwide.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why Work With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="card text-center">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-400 text-sm">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Open Positions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {positions.map((position, index) => (
              <div key={index} className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="text-sm text-amber-400">{position.department}</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-400">{position.location}</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-400">{position.type}</span>
                    </div>
                    <p className="text-slate-400">{position.description}</p>
                  </div>
                  <button className="btn-primary whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400">
            Don't see a position that fits? 
            <Link to="/contact" className="text-amber-400 hover:text-amber-300 ml-2">Send us your resume</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
