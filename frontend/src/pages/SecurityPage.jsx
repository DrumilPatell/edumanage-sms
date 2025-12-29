import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Eye, Database, Key, CheckCircle } from 'lucide-react'

export default function SecurityPage() {
  const features = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data transmitted between your browser and our servers is encrypted using industry-standard TLS 1.3 protocol.'
    },
    {
      icon: Database,
      title: 'Secure Data Storage',
      description: 'Your data is stored in SOC 2 Type II certified data centers with military-grade encryption at rest.'
    },
    {
      icon: Key,
      title: 'Authentication & Authorization',
      description: 'Multi-factor authentication and role-based access control ensure only authorized users can access sensitive information.'
    },
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'We never sell your data. Your information is yours and is only used to provide and improve our service.'
    },
    {
      icon: Shield,
      title: 'Regular Security Audits',
      description: 'Our systems undergo regular penetration testing and security audits by third-party security experts.'
    },
    {
      icon: CheckCircle,
      title: 'Compliance',
      description: 'We comply with GDPR, FERPA, and other major data protection regulations to keep your data safe and compliant.'
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
            <Shield className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            Security & Privacy
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Your data security and privacy are our top priorities. Learn how we protect your information.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="card max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Our Security Commitments</h2>
          <div className="space-y-4 text-slate-300">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">24/7 Monitoring:</strong> Our security team monitors systems around the clock for any suspicious activity.
              </p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Regular Updates:</strong> We keep all systems patched and updated with the latest security fixes.
              </p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Backup & Recovery:</strong> Automated daily backups ensure your data can be recovered in case of any incident.
              </p>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Incident Response:</strong> We have a dedicated incident response team ready to handle any security events.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-center">
              Have security concerns or questions? 
              <Link to="/contact" className="text-amber-400 hover:text-amber-300 ml-2">Contact our security team</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
