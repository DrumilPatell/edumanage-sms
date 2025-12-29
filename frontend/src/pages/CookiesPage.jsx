import { Link } from 'react-router-dom'
import { ArrowLeft, Cookie } from 'lucide-react'

export default function CookiesPage() {
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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
            <Cookie className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
        </div>

        <div className="space-y-8 text-slate-300">
          <section className="card">
            <p className="text-sm text-slate-400 mb-4">Last Updated: January 2024</p>
            <p className="text-lg leading-relaxed">
              This Cookie Policy explains how EduManage ("we", "us", or "our") uses cookies and similar 
              technologies when you visit our website and use our services.
            </p>
          </section>

          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. They are 
              widely used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Essential Cookies</h3>
                <p className="leading-relaxed">
                  These cookies are necessary for the website to function and cannot be disabled. They include:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Authentication and security cookies</li>
                  <li>Session management cookies</li>
                  <li>User preference cookies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Analytics Cookies</h3>
                <p className="leading-relaxed">
                  These cookies help us understand how visitors interact with our website by collecting 
                  anonymous information:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Pages visited and time spent on each page</li>
                  <li>Navigation paths through the website</li>
                  <li>Device and browser information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Functional Cookies</h3>
                <p className="leading-relaxed">
                  These cookies enable enhanced functionality and personalization:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Language preferences</li>
                  <li>Theme preferences (dark/light mode)</li>
                  <li>Recently viewed items</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
            <p className="leading-relaxed mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-white">Browser Settings:</strong> Most browsers allow you to refuse 
                or accept cookies through their settings.
              </li>
              <li>
                <strong className="text-white">Cookie Preferences:</strong> You can manage your cookie 
                preferences through our cookie consent banner.
              </li>
              <li>
                <strong className="text-white">Third-Party Tools:</strong> You can use browser extensions 
                or privacy tools to manage cookies.
              </li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
            <p className="leading-relaxed">
              We may use third-party services that set their own cookies, including:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Google Analytics for website analytics</li>
              <li>Authentication providers for secure login</li>
              <li>Content delivery networks for performance</li>
            </ul>
          </section>

          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="card">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p className="mt-4">
              <a href="mailto:drumilpatel0987@gmail.com" className="text-amber-400 hover:text-amber-300">
                drumilpatel0987@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
