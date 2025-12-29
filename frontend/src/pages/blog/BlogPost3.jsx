import { Link } from 'react-router-dom'
import { ArrowLeft, Code, Terminal, Zap, BookOpen } from 'lucide-react'

export default function BlogPost3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <Link
        to="/blog"
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Blog</span>
      </Link>

      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-amber-400 font-semibold">Technical</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-400">January 5, 2024</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            API Integration Guide for EduManage
          </h1>
          <p className="text-xl text-slate-400">
            A comprehensive guide to integrating EduManage with your existing systems using our powerful API.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-invert max-w-none">
          <div className="card mb-8">
            <p className="text-slate-300 leading-relaxed">
              EduManage offers a robust RESTful API that allows you to integrate our student management system with your existing applications and workflows. This guide will walk you through everything you need to know to get started.
            </p>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-amber-400" />
              Getting Started
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Before you begin integrating with the EduManage API, you'll need:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>An active EduManage Professional or Enterprise account</li>
              <li>API credentials (API key and secret)</li>
              <li>Basic understanding of RESTful APIs and HTTP methods</li>
              <li>A development environment for testing</li>
            </ul>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Code className="w-6 h-6 text-amber-400" />
              Authentication
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              The EduManage API uses OAuth 2.0 and JWT tokens for authentication. Here's a quick example:
            </p>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre className="text-slate-300">
{`# Request an access token
curl -X POST \\
  https://api.edumanage.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET"}'`}
              </pre>
            </div>
            <p className="text-slate-300 leading-relaxed">
              The response will include an access token that you'll use for all subsequent API calls. Include this token in the Authorization header of your requests.
            </p>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Common API Endpoints</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Here are the most frequently used endpoints:
            </p>
            
            <div className="space-y-4">
              <div className="bg-slate-950/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">GET</span>
                  <code className="text-amber-400">/v1/students</code>
                </div>
                <p className="text-sm text-slate-400">Retrieve all students with optional filtering and pagination</p>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">POST</span>
                  <code className="text-amber-400">/v1/students</code>
                </div>
                <p className="text-sm text-slate-400">Create a new student record</p>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">GET</span>
                  <code className="text-amber-400">/v1/students/{'{'}id{'}'}</code>
                </div>
                <p className="text-sm text-slate-400">Get a specific student by ID</p>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-bold">PUT</span>
                  <code className="text-amber-400">/v1/students/{'{'}id{'}'}</code>
                </div>
                <p className="text-sm text-slate-400">Update student information</p>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">DELETE</span>
                  <code className="text-amber-400">/v1/students/{'{'}id{'}'}</code>
                </div>
                <p className="text-sm text-slate-400">Delete a student record</p>
              </div>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Terminal className="w-6 h-6 text-amber-400" />
              Example: Creating a Student
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Here's a complete example of creating a new student:
            </p>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-green-400"># Create a new student</div>
              <div className="text-slate-300">curl -X POST \</div>
              <div className="text-slate-300 ml-4">https://api.edumanage.com/v1/students \</div>
              <div className="text-slate-300 ml-4">-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \</div>
              <div className="text-slate-300 ml-4">-H "Content-Type: application/json" \</div>
              <div className="text-slate-300 ml-4">-d '&#123;</div>
              <div className="text-slate-300 ml-8">"student_id": "STU2024001",</div>
              <div className="text-slate-300 ml-8">"first_name": "John",</div>
              <div className="text-slate-300 ml-8">"last_name": "Doe",</div>
              <div className="text-slate-300 ml-8">"email": "john.doe@example.com",</div>
              <div className="text-slate-300 ml-8">"date_of_birth": "2006-05-15",</div>
              <div className="text-slate-300 ml-8">"enrollment_date": "2024-01-15"</div>
              <div className="text-slate-300 ml-4">&#125;'</div>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-400" />
              Rate Limiting and Best Practices
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              To ensure optimal performance, please follow these guidelines:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li><strong className="text-white">Rate Limits:</strong> 1000 requests per hour for Professional, 5000 for Enterprise</li>
              <li><strong className="text-white">Pagination:</strong> Use pagination for large datasets (max 100 items per page)</li>
              <li><strong className="text-white">Caching:</strong> Cache responses when appropriate to reduce API calls</li>
              <li><strong className="text-white">Error Handling:</strong> Implement proper error handling and retry logic</li>
              <li><strong className="text-white">Webhooks:</strong> Use webhooks for real-time updates instead of polling</li>
            </ul>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Webhooks</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              EduManage supports webhooks for real-time event notifications. You can subscribe to events like:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>Student enrollment</li>
              <li>Grade updates</li>
              <li>Attendance changes</li>
              <li>Course modifications</li>
            </ul>
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Testing and Sandbox</h2>
            <p className="text-slate-300 leading-relaxed">
              We provide a sandbox environment for testing your integrations without affecting production data. Use the sandbox API endpoint at <code className="text-amber-400 bg-slate-950 px-2 py-1 rounded">https://sandbox-api.edumanage.com</code> for all development and testing purposes.
            </p>
          </div>

          <div className="card bg-amber-500/10 border-amber-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Our API documentation includes detailed examples, response schemas, and troubleshooting guides. For additional support:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>Visit our <Link to="/api-docs" className="text-amber-400 hover:text-amber-300">complete API documentation</Link></li>
              <li>Join our developer community forum</li>
              <li>Contact our technical support team</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  )
}
