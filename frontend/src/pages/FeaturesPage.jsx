import { Link } from 'react-router-dom'
import { ArrowLeft, Star, Check } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      title: 'Student Management',
      description: 'Complete student lifecycle management from enrollment to graduation',
      items: ['Student profiles', 'Enrollment tracking', 'Academic records', 'Performance analytics']
    },
    {
      title: 'Course Management',
      description: 'Organize and manage all your courses and curriculum',
      items: ['Course catalog', 'Scheduling', 'Faculty assignment', 'Resource management']
    },
    {
      title: 'Attendance Tracking',
      description: 'Automated attendance monitoring and reporting',
      items: ['Real-time tracking', 'Attendance reports', 'Notifications', 'Integration with gradebook']
    },
    {
      title: 'Grade Management',
      description: 'Comprehensive grading and assessment tools',
      items: ['Gradebook', 'Custom grading scales', 'Report cards', 'Performance insights']
    },
    {
      title: 'User Roles & Permissions',
      description: 'Flexible role-based access control',
      items: ['Admin access', 'Faculty portal', 'Student portal', 'Custom permissions']
    },
    {
      title: 'Analytics & Reporting',
      description: 'Data-driven insights for better decision making',
      items: ['Custom reports', 'Dashboard analytics', 'Export capabilities', 'Trend analysis']
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
            Features
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to manage your educational institution efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
