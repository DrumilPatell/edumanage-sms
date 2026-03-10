import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { studentsApi, academicApi, enrollmentsApi } from '../services/api'
import { ChevronLeft, ChevronRight, BookOpen, Check, X } from 'lucide-react'

export default function StudentAttendancePage() {
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => studentsApi.getMyProfile(),
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => profile ? enrollmentsApi.getStudentEnrollments(profile.id) : [],
    enabled: !!profile,
  })

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: () => academicApi.getMyAttendance(),
    enabled: !!profile,
  })

  // Get unique courses from enrollments with enrollment date
  const courses = useMemo(() => {
    return enrollments.map(e => ({
      id: e.course_id,
      name: e.course_name,
      code: e.course_code,
      enrollmentDate: e.enrollment_date
    }))
  }, [enrollments])

  // Get enrollment date for selected course
  const selectedCourseEnrollmentDate = useMemo(() => {
    if (!selectedCourseId) return null
    const course = courses.find(c => c.id === selectedCourseId)
    return course?.enrollmentDate ? new Date(course.enrollmentDate) : null
  }, [selectedCourseId, courses])

  // Navigate to enrollment month when course is selected
  useEffect(() => {
    if (selectedCourseEnrollmentDate) {
      setCurrentDate(new Date(selectedCourseEnrollmentDate.getFullYear(), selectedCourseEnrollmentDate.getMonth(), 1))
    }
  }, [selectedCourseEnrollmentDate])

  // Filter attendance for selected course
  const filteredAttendance = useMemo(() => {
    if (!selectedCourseId) return []
    return attendance.filter(a => a.course_id === selectedCourseId)
  }, [attendance, selectedCourseId])

  // Create attendance map for quick lookup
  const attendanceMap = useMemo(() => {
    const map = {}
    filteredAttendance.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0]
      map[dateKey] = record
    })
    return map
  }, [filteredAttendance])

  // Calculate stats for selected course
  const stats = useMemo(() => {
    const total = filteredAttendance.length
    const present = filteredAttendance.filter(a => a.status === 'present').length
    const absent = filteredAttendance.filter(a => a.status === 'absent').length
    const percentage = total > 0 ? (present / total * 100).toFixed(1) : 0
    return { total, present, absent, percentage }
  }, [filteredAttendance])

  // Calendar helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPrevMonth = () => {
    // Don't go before enrollment month
    if (selectedCourseEnrollmentDate) {
      const prevMonth = new Date(year, month - 1, 1)
      const enrollmentMonth = new Date(selectedCourseEnrollmentDate.getFullYear(), selectedCourseEnrollmentDate.getMonth(), 1)
      if (prevMonth < enrollmentMonth) return
    }
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    // If today is before enrollment, go to enrollment month instead
    if (selectedCourseEnrollmentDate && today < selectedCourseEnrollmentDate) {
      setCurrentDate(new Date(selectedCourseEnrollmentDate.getFullYear(), selectedCourseEnrollmentDate.getMonth(), 1))
    } else {
      setCurrentDate(today)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Check className="w-3 h-3 text-green-400" />
      case 'absent':
        return <X className="w-3 h-3 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'absent': return 'bg-red-500/20 border-red-500/50 text-red-400'
      default: return ''
    }
  }

  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: null, attendance: null, isBeforeEnrollment: false })
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const currentDayDate = new Date(year, month, day)
    
    // Check if this date is before enrollment date
    let isBeforeEnrollment = false
    if (selectedCourseEnrollmentDate) {
      const enrollmentDateOnly = new Date(selectedCourseEnrollmentDate)
      enrollmentDateOnly.setHours(0, 0, 0, 0)
      currentDayDate.setHours(0, 0, 0, 0)
      isBeforeEnrollment = currentDayDate < enrollmentDateOnly
    }
    
    calendarDays.push({
      day,
      dateKey,
      attendance: attendanceMap[dateKey] || null,
      isToday: new Date().toISOString().split('T')[0] === dateKey,
      isBeforeEnrollment
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">My Attendance</h1>
        <p className="text-slate-400 mt-1">Select a course to view your attendance calendar</p>
      </div>

      {/* Course Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-slate-300 mb-3">Select Course</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => {
            const courseAttendance = attendance.filter(a => a.course_id === course.id)
            const coursePresent = courseAttendance.filter(a => a.status === 'present').length
            const courseTotal = courseAttendance.length
            const coursePercentage = courseTotal > 0 ? ((coursePresent / courseTotal) * 100).toFixed(0) : 0
            
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCourseId === course.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedCourseId === course.id ? 'bg-amber-500/20' : 'bg-slate-700/50'
                    }`}>
                      <BookOpen className={`w-5 h-5 ${
                        selectedCourseId === course.id ? 'text-amber-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        selectedCourseId === course.id ? 'text-amber-400' : 'text-white'
                      }`}>{course.name}</p>
                      <p className="text-sm text-slate-400">{course.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      coursePercentage >= 75 ? 'text-green-400' : coursePercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>{coursePercentage}%</p>
                    <p className="text-xs text-slate-400">{courseTotal} classes</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {courses.length === 0 && (
          <p className="text-slate-400 text-center py-4">No courses enrolled</p>
        )}
      </div>

      {/* Calendar View - Only show when course is selected */}
      {selectedCourseId && (
        <>
          {/* Stats for selected course */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{stats.percentage}%</p>
                <p className="text-xs text-amber-200/70">Attendance</p>
              </div>
            </div>
            <div className="card py-3">
              <div className="text-center">
                <p className="text-xl font-bold text-green-400">{stats.present}</p>
                <p className="text-xs text-slate-400">Present</p>
              </div>
            </div>
            <div className="card py-3">
              <div className="text-center">
                <p className="text-xl font-bold text-red-400">{stats.absent}</p>
                <p className="text-xs text-slate-400">Absent</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="card py-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {monthNames[month]} {year}
                </h3>
                {selectedCourseEnrollmentDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enrolled: {new Date(selectedCourseEnrollmentDate).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToPrevMonth}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((item, index) => (
                <div
                  key={index}
                  className={`h-12 sm:h-14 md:h-16 p-1 rounded flex flex-col items-center justify-center relative ${
                    item.day === null 
                      ? 'bg-transparent' 
                      : item.isBeforeEnrollment
                        ? 'bg-slate-900/50 border border-slate-800/50 opacity-40'
                        : item.attendance 
                          ? getStatusColor(item.attendance.status)
                          : item.isToday
                            ? 'bg-slate-700/50 border border-amber-500/50'
                            : 'bg-slate-800/30 border border-slate-700/30'
                  }`}
                >
                  {item.day && (
                    <>
                      <span className={`text-xs sm:text-sm font-medium ${
                        item.isBeforeEnrollment 
                          ? 'text-slate-600 line-through' 
                          : item.attendance 
                            ? '' 
                            : item.isToday 
                              ? 'text-amber-400' 
                              : 'text-slate-300'
                      }`}>
                        {item.day}
                      </span>
                      {item.attendance && !item.isBeforeEnrollment && (
                        <div className="mt-0">
                          {getStatusIcon(item.attendance.status)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-400" />
                </div>
                <span className="text-xs text-slate-400">Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                  <X className="w-2 h-2 text-red-400" />
                </div>
                <span className="text-xs text-slate-400">Absent</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state when no course selected */}
      {!selectedCourseId && courses.length > 0 && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Select a Course</h3>
            <p className="text-slate-400">Choose a course above to view your attendance calendar</p>
          </div>
        </div>
      )}
    </div>
  )
}
