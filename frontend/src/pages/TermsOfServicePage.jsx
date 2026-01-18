import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, GraduationCap } from 'lucide-react'

export default function TermsOfServicePage() {
  const location = useLocation()
  const fromLogin = location.state?.fromLogin || false
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <Link
        to={fromLogin ? "/login" : "/"}
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{fromLogin ? "Back to Login" : "Back to Home"}</span>
      </Link>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Terms of Service
          </h1>
          <p className="text-slate-400">
            Last updated: December 20, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl space-y-6 text-slate-300">
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the Student Management System ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Use License</h2>
            <p className="leading-relaxed mb-3">
              Permission is granted to temporarily access the materials (information or software) on the Student Management System for personal, non-commercial educational use only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="leading-relaxed mb-3">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account and password</li>
              <li>Restricting access to your computer and account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. User Roles and Permissions</h2>
            <p className="leading-relaxed">
              The Service provides different access levels based on user roles (Student, Faculty, Admin). Users must select their appropriate role during registration and are expected to use the Service only for purposes aligned with their designated role.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Prohibited Activities</h2>
            <p className="leading-relaxed mb-3">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Copying, distributing, or disclosing any part of the Service</li>
              <li>Using any automated system to access the Service</li>
              <li>Transmitting spam, chain letters, or other unsolicited communications</li>
              <li>Attempting to interfere with, compromise the system integrity or security</li>
              <li>Impersonating another user or person</li>
              <li>Using the account, username, or password of another user at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p className="leading-relaxed">
              The Service and its original content, features, and functionality are and will remain the exclusive property of the Student Management System and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Termination</h2>
            <p className="leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              In no event shall the Student Management System, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your access to or use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at drumilpatel0987@gmail.com
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          © 2026 Student Management System. All rights reserved.
        </div>
      </div>
    </div>
  )
}
