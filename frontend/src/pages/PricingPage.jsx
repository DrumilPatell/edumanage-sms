import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small schools and institutions',
      features: [
        'Up to 100 students',
        '5 faculty members',
        'Basic analytics',
        'Email support',
        'Mobile app access',
        'Core features included'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Ideal for growing institutions',
      features: [
        'Up to 500 students',
        '25 faculty members',
        'Advanced analytics',
        'Priority support',
        'Mobile app access',
        'All core features',
        'Custom reports',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large universities and organizations',
      features: [
        'Unlimited students',
        'Unlimited faculty',
        'Enterprise analytics',
        '24/7 dedicated support',
        'Mobile app access',
        'All features included',
        'Custom integrations',
        'SLA guarantee',
        'Dedicated account manager'
      ],
      popular: false
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your institution. All plans include a 30-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card relative ${
                plan.popular ? 'border-2 border-amber-500 shadow-2xl shadow-amber-500/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-amber-400">{plan.price}</span>
                  <span className="text-slate-400 mb-1">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4">
            Need a custom solution? <Link to="/contact" className="text-amber-400 hover:text-amber-300">Contact our sales team</Link>
          </p>
          <p className="text-sm text-slate-500">
            All prices in USD. Annual billing available with 20% discount.
          </p>
        </div>
      </div>
    </div>
  )
}
