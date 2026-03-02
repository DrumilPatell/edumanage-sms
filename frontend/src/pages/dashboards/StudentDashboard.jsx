import { useQuery } from '@tanstack/react-query'
import { studentsApi, enrollmentsApi, academicApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { BookOpen, Award, Calendar, ClipboardCheck } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentsApi.getMyProfile(),
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => profile ? enrollmentsApi.getStudentEnrollments(profile.id) : [],
    enabled: !!profile,
  })

  const { data: grades = [] } = useQuery({
    queryKey: ['my-grades'],
    queryFn: () => profile ? academicApi.getGrades({ student_id: profile.id }) : [],
    enabled: !!profile,
  })

  const { data: attendance = [] } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => academicApi.getMyAttendance(),
    enabled: !!profile,
  })

  // Calculate attendance statistics
  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
  }
  const attendancePercentage = attendanceStats.total > 0 
    ? ((attendanceStats.present + attendanceStats.late) / attendanceStats.total * 100).toFixed(1)
    : 0

  const stats = [
    {
      name: 'Enrolled Courses',
      value: enrollments.length,
      icon: BookOpen,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      name: 'Current GPA',
      value: profile?.gpa?.toFixed(2) || 'N/A',
      icon: Award,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      borderColor: 'border-green-500/20',
    },
    {
      name: 'Semester',
      value: profile?.current_semester || 'N/A',
      icon: Calendar,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      name: 'Attendance',
      value: `${attendancePercentage}%`,
      icon: ClipboardCheck,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user?.full_name}!</p>
      </div>

      {/* Profile Card */}
      <div className="card bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">{user?.full_name}</h2>
            <p className="text-amber-200/80 mb-1">Student ID: {profile?.student_id || 'N/A'}</p>
            <p className="text-amber-200/80">Program: {profile?.program || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-200/80">Current Semester</p>
            <p className="text-3xl font-bold text-amber-400">{profile?.current_semester || '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg">Total: {enrollments.length}</span>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-white">{enrollment.course_name}</h4>
                <p className="text-sm text-slate-400">{enrollment.course_code}</p>
              </div>
              <span className={`badge ${
                enrollment.status === 'active' ? 'badge-success' :
                enrollment.status === 'completed' ? 'badge-primary' :
                'badge-warning'
              }`}>
                {enrollment.status}
              </span>
            </div>
          ))}
          {enrollments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No course enrollments yet</p>
          )}
        </div>
      </div>

      {/* Recent Grades */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Grades</h3>
        <div className="space-y-3">
          {grades.slice(0, 5).map((grade) => (
            <div key={grade.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-white">{grade.assessment_name}</p>
                <p className="text-sm text-slate-400">{grade.assessment_type}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-amber-400">{grade.score}/{grade.max_score}</p>
                {grade.percentage && (
                  <p className="text-sm text-slate-400">{grade.percentage.toFixed(1)}%</p>
                )}
              </div>
            </div>
          ))}
          {grades.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No grades yet</p>
          )}
        </div>
      </div>

      {/* My Attendance */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Attendance</h3>
          <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded-lg">
            {attendancePercentage}% Overall
          </span>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-400">{attendanceStats.present}</p>
            <p className="text-xs text-green-300/70">Present</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-400">{attendanceStats.absent}</p>
            <p className="text-xs text-red-300/70">Absent</p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-400">{attendanceStats.late}</p>
            <p className="text-xs text-yellow-300/70">Late</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-400">{attendanceStats.excused}</p>
            <p className="text-xs text-blue-300/70">Excused</p>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {attendance.slice(0, 20).map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-white">{record.course_name}</p>
                <p className="text-sm text-slate-400">{record.course_code}</p>
              </div>
              <div className="text-right">
                <span className={`badge ${
                  record.status === 'present' ? 'badge-success' :
                  record.status === 'absent' ? 'badge-error' :
                  record.status === 'late' ? 'badge-warning' :
                  'badge-primary'
                }`}>
                  {record.status}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
          {attendance.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No attendance records yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
