import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { coursesApi, studentsApi, enrollmentsApi, academicApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { BookOpen, Users, Award, UserCheck, PlusCircle, ClipboardCheck } from 'lucide-react'
import { useMemo } from 'react'

export default function FacultyDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const { data: myCourses = [] } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => coursesApi.getMyCourses(),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getStudents({ limit: 100 }),
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => enrollmentsApi.getEnrollments({ limit: 1000 }),
  })

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => academicApi.getGrades({ limit: 1000 }),
  })

  // Calculate pending grades: enrolled students in faculty's courses minus those already graded
  const pendingGrades = useMemo(() => {
    const myCourseIds = new Set(myCourses.map(c => c.id))
    // Count enrollments in faculty's courses
    const myEnrollments = enrollments.filter(e => myCourseIds.has(e.course_id))
    // Count unique student-course pairs that already have grades
    const gradedPairs = new Set(
      grades
        .filter(g => myCourseIds.has(g.course_id))
        .map(g => `${g.student_id}-${g.course_id}`)
    )
    // Pending = enrollments without any grade
    const pending = myEnrollments.filter(e => !gradedPairs.has(`${e.student_id}-${e.course_id}`))
    return pending.length
  }, [myCourses, enrollments, grades])

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
      value: pendingGrades,
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Courses</h3>
          <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg">Total: {myCourses.length}</span>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
