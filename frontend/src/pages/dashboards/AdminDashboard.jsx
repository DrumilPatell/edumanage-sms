import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { usersApi, studentsApi, coursesApi, enrollmentsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { Users, UserCheck, BookOpen, ClipboardList, UserPlus, PlusCircle, Award, ClipboardCheck } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ limit: 1000 }),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getStudents({ limit: 1000 }),
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses({ limit: 1000 }),
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => enrollmentsApi.getEnrollments({ limit: 1000 }),
  })

  const stats = [
    {
      name: 'Total Users',
      value: users.length,
      icon: Users,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      name: 'Students',
      value: students.length,
      icon: UserCheck,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    {
      name: 'Courses',
      value: courses.length,
      icon: BookOpen,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      name: 'Enrollments',
      value: enrollments.length,
      icon: ClipboardList,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your student management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Students</h3>
          <div className="space-y-3">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-sm font-semibold text-white">
                    {student.full_name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{student.full_name}</p>
                  <p className="text-sm text-slate-400 truncate">{student.student_id}</p>
                </div>
                <span className="badge-primary">{student.program || 'N/A'}</span>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No students yet</p>
            )}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Active Courses</h3>
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{course.course_name}</p>
                  <p className="text-sm text-slate-400">{course.course_code}</p>
                </div>
                <span className="badge-success">{course.credits} Credits</span>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No courses yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button 
            onClick={() => navigate('/add-user')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 hover:border-amber-500/50 transition-all group"
          >
            <UserPlus className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-300 text-center">Add User</span>
          </button>
          
          <button 
            onClick={() => navigate('/add-student')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 hover:border-amber-500/50 transition-all group"
          >
            <UserCheck className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-300 text-center">Add Student</span>
          </button>
          
          <button 
            onClick={() => navigate('/add-course')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 hover:border-amber-500/50 transition-all group"
          >
            <PlusCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-300 text-center">Add Course</span>
          </button>
          
          <button 
            onClick={() => navigate('/enroll-student')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 hover:border-amber-500/50 transition-all group"
          >
            <BookOpen className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-300 text-center">Enroll Student</span>
          </button>
          
          <button 
            onClick={() => navigate('/mark-attendance')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 hover:border-amber-500/50 transition-all group"
          >
            <ClipboardCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-300 text-center">Mark Attendance</span>
          </button>
          
          <button 
            onClick={() => navigate('/assign-grade')}
            className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-600/50 hover:border-amber-500/50 transition-all group"
          >
            <Award className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-slate-300 text-center">Assign Grade</span>
          </button>
        </div>
      </div>
    </div>
  )
}
