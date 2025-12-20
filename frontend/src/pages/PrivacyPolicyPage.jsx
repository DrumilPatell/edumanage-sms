import { Link } from 'react-router-dom'
import { ArrowLeft, GraduationCap } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <Link
        to="/login"
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Login</span>
      </Link>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Privacy Policy
          </h1>
          <p className="text-slate-400">
            Last updated: December 20, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl space-y-6 text-slate-300">
          
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Introduction</h2>
            <p className="leading-relaxed">
              This Privacy Policy explains how Student Management System ("we", "us", or "our") collects, uses, and protects your personal information when you use our Service. We are committed to protecting your privacy and ensuring the security of your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-2 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, full name, password (encrypted)</li>
              <li><strong>Profile Information:</strong> Role (Student, Faculty, Admin), profile picture</li>
              <li><strong>Academic Data:</strong> Course enrollments, grades, attendance records</li>
            </ul>

            <h3 className="text-xl font-semibold text-amber-400 mb-2 mt-4">2.2 OAuth Authentication Data</h3>
            <p className="leading-relaxed ml-4 mb-2">
              When you sign in using OAuth providers (Google, Microsoft, GitHub), we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-8">
              <li>Email address</li>
              <li>Full name</li>
              <li>Profile picture (if available)</li>
              <li>OAuth provider identifier</li>
            </ul>

            <h3 className="text-xl font-semibold text-amber-400 mb-2 mt-4">2.3 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address and browser information</li>
              <li>Access times and dates</li>
              <li>Usage patterns and interactions with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our Service</li>
              <li>To authenticate and manage user accounts</li>
              <li>To track academic progress and performance</li>
              <li>To enable communication between students and faculty</li>
              <li>To improve and personalize user experience</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To send important notifications and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Data Security</h2>
            <p className="leading-relaxed mb-3">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Password Encryption:</strong> All passwords are hashed using bcrypt encryption</li>
              <li><strong>Secure Transmission:</strong> Data is transmitted over HTTPS connections</li>
              <li><strong>Access Control:</strong> Role-based access ensures users can only view and modify authorized data</li>
              <li><strong>OAuth Security:</strong> OAuth 2.0 protocol for secure third-party authentication</li>
              <li><strong>Database Security:</strong> PostgreSQL database with appropriate access controls</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Data Sharing and Disclosure</h2>
            <p className="leading-relaxed mb-3">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Within the Institution:</strong> Academic data is shared with authorized faculty and administrators</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="leading-relaxed mb-3">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for data processing at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Cookies and Tracking</h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to maintain your session and improve your experience. You can control cookie settings through your browser preferences. Note that disabling cookies may limit certain features of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. Academic records may be retained for longer periods as required by educational regulations. You may request deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">9. Third-Party Services</h2>
            <p className="leading-relaxed mb-3">
              Our Service integrates with third-party OAuth providers:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Google (Google Sign-In)</li>
              <li>Microsoft (Microsoft Account)</li>
              <li>GitHub (GitHub OAuth)</li>
            </ul>
            <p className="leading-relaxed mt-3">
              These services have their own privacy policies. We encourage you to review their privacy policies to understand how they handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">10. Children's Privacy</h2>
            <p className="leading-relaxed">
              Our Service is intended for educational institutions and may be used by students of various ages. We comply with applicable laws regarding children's privacy. Parental consent may be required for users under 13 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">11. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">12. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="ml-4 mt-3 space-y-1">
              <p>Email: privacy@studentmanagementsystem.com</p>
              <p>Support: support@studentmanagementsystem.com</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          © 2025 Student Management System. All rights reserved.
        </div>
      </div>
    </div>
  )
}
