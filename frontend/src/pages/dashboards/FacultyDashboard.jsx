import { useQuery } from '@tanstack/react-query'
import { coursesApi, studentsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { BookOpen, Users, Award } from 'lucide-react'

export default function FacultyDashboard() {
  const { user } = useAuthStore()
  const { data: myCourses = [] } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => coursesApi.getMyCourses(),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getStudents({ limit: 100 }),
  })

  const stats = [
    {
      name: 'My Courses',
      value: myCourses.length,
      icon: BookOpen,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      name: 'Total Students',
      value: students.length,
      icon: Users,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    {
      name: 'Pending Grades',
      value: 0,
      icon: Award,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>
        <p className="text-slate-400 mt-1">Manage your courses and students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* My Courses */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">My Courses</h3>
        <div className="space-y-3">
          {myCourses.map((course) => (
            <div key={course.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-white">{course.course_name}</h4>
                <p className="text-sm text-slate-400">{course.course_code} • {course.semester || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-success">{course.credits} Credits</span>
                {course.is_active && <span className="badge-primary">Active</span>}
              </div>
            </div>
          ))}
          {myCourses.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No courses assigned yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="btn-primary">Mark Attendance</button>
          <button className="btn-primary">Enter Grades</button>
          <button className="btn-secondary">View Students</button>
        </div>
      </div>
    </div>
  )
}
