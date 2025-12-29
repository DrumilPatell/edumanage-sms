import { Link } from 'react-router-dom'
import { ArrowLeft, HelpCircle, BookOpen, MessageCircle, Video, FileText } from 'lucide-react'

export default function HelpCenterPage() {
  const categories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of EduManage',
      articles: [
        'Quick start guide',
        'Setting up your institution',
        'Adding your first students',
        'Inviting faculty members'
      ]
    },
    {
      icon: MessageCircle,
      title: 'Student Management',
      description: 'Managing student records and data',
      articles: [
        'Creating student profiles',
        'Enrollment process',
        'Bulk import students',
        'Student data privacy'
      ]
    },
    {
      icon: Video,
      title: 'Course & Attendance',
      description: 'Setting up courses and tracking attendance',
      articles: [
        'Creating courses',
        'Scheduling classes',
        'Taking attendance',
        'Attendance reports'
      ]
    },
    {
      icon: FileText,
      title: 'Grading & Reports',
      description: 'Grade management and reporting',
      articles: [
        'Setting up gradebook',
        'Entering grades',
        'Generating report cards',
        'Analytics dashboard'
      ]
    }
  ]

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.'
    },
    {
      question: 'Can I import existing student data?',
      answer: 'Yes, you can bulk import students using a CSV file. Go to Students > Import and download the template.'
    },
    {
      question: 'What file formats are supported for documents?',
      answer: 'We support PDF, DOC, DOCX, XLS, XLSX, and common image formats (JPG, PNG).'
    },
    {
      question: 'How do I add multiple faculty members at once?',
      answer: 'Use the bulk import feature under Users > Import. Download the template to ensure correct formatting.'
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
            <HelpCircle className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Find answers, get support, and learn how to make the most of EduManage
          </p>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <div key={index} className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, i) => (
                      <li key={i} className="text-sm text-slate-300 hover:text-amber-400 transition-colors cursor-pointer">
                        → {article}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="card max-w-4xl mx-auto mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
          <p className="text-slate-400 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link to="/contact" className="btn-primary inline-block">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
