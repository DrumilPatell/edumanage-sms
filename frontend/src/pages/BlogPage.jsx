import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Lightbulb, Code, TrendingUp } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    {
      icon: Lightbulb,
      title: '10 Best Practices for Student Data Management',
      excerpt: 'Learn how to effectively manage and secure student information while maintaining compliance with data protection regulations.',
      date: 'January 15, 2024',
      category: 'Best Practices',
      slug: 'student-data-management-best-practices'
    },
    {
      icon: TrendingUp,
      title: 'The Future of Education Technology',
      excerpt: 'Explore emerging trends in EdTech and how they are transforming the way institutions manage their operations.',
      date: 'January 10, 2024',
      category: 'Trends',
      slug: 'future-of-education-technology'
    },
    {
      icon: Code,
      title: 'API Integration Guide for EduManage',
      excerpt: 'A comprehensive guide to integrating EduManage with your existing systems using our powerful API.',
      date: 'January 5, 2024',
      category: 'Technical',
      slug: 'api-integration-guide'
    },
    {
      icon: BookOpen,
      title: 'Improving Student Engagement Through Data',
      excerpt: 'Discover how analytics and data-driven insights can help improve student engagement and academic outcomes.',
      date: 'December 28, 2023',
      category: 'Education',
      slug: 'improving-student-engagement'
    },
    {
      icon: Lightbulb,
      title: 'Streamlining Enrollment Processes',
      excerpt: 'Tips and strategies for making student enrollment smoother and more efficient for both staff and students.',
      date: 'December 20, 2023',
      category: 'Best Practices',
      slug: 'streamlining-enrollment-processes'
    },
    {
      icon: TrendingUp,
      title: 'Year in Review: 2023 Platform Updates',
      excerpt: 'A look back at all the new features and improvements we shipped in 2023 to make EduManage even better.',
      date: 'December 15, 2023',
      category: 'Updates',
      slug: 'year-in-review-2023'
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
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent leading-tight pb-2">
            Blog
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Insights, updates, and best practices for education management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => {
            const Icon = post.icon
            return (
              <Link key={index} to={`/blog/${post.slug}`}>
                <article className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all cursor-pointer group h-full">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-amber-400 font-semibold">{post.category}</span>
                    <span className="text-xs text-slate-500">{post.date}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-400 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="text-amber-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read More
                    <span>→</span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400">
            More articles coming soon. 
            <Link to="/contact" className="text-amber-400 hover:text-amber-300 ml-2">Subscribe to our newsletter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
