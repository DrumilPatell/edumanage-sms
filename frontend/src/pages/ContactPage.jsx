import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import { submitContactForm } from '../lib/api'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await submitContactForm(formData)
      setSubmitStatus({ type: 'success', message: result.message })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to send message. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-xl text-slate-400 text-center mb-12">
          Have questions? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                  <a href="mailto:drumilpatel0987@gmail.com" className="text-slate-400 hover:text-amber-400 transition-colors">
                    drumilpatel0987@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                  <p className="text-slate-400">+91 90548XXXXX</p>
                  <p className="text-slate-500 text-sm mt-1">Mon-Fri, 10am-6pm IST</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Office</h3>
                  <p className="text-slate-400">
                    Surya City<br />
                    Ahmedabad Gujarat<br />
                    India 
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="input-field"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="input-field resize-none"
                  rows="5"
                  placeholder="Tell us more..."
                />
              </div>

              {submitStatus && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
